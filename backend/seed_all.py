import os
os.environ["GRPC_DNS_RESOLVER"] = "native"
import json
import firebase_admin
from firebase_admin import credentials, firestore

def main():
    backup_dir = "backend/data/backup"
    if not os.path.exists(backup_dir):
        print(f"Error: Backup directory {backup_dir} not found.")
        return
        
    if not firebase_admin._apps:
        key_path = "backend/serviceAccountKey.json"
        if os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized with local serviceAccountKey.json.")
        else:
            firebase_admin.initialize_app()
            print("Firebase initialized with default credentials.")
            
    db = firestore.client()
    
    # 1. Upload Channel Stats
    channel_path = os.path.join(backup_dir, "channel.json")
    if os.path.exists(channel_path):
        print("Uploading channel stats...")
        with open(channel_path, "r", encoding="utf-8") as f:
            channel_data = json.load(f)
        db.collection("channel").document("stats").set(channel_data)
        print("Uploaded channel stats successfully.")
        
    # 2. Upload Onboarding Stages
    stages_path = os.path.join(backup_dir, "onboardingStages.json")
    if os.path.exists(stages_path):
        print("Uploading onboarding stages...")
        with open(stages_path, "r", encoding="utf-8") as f:
            stages = json.load(f)
        for company, stages_list in stages.items():
            db.collection("onboardingStages").document(company).set({"stages": stages_list})
        print("Uploaded onboarding stages successfully.")
        
    # 3. Upload other collections
    collections = ["playlists", "videos", "resources", "experiences", "flashcards", "notes"]
    for coll in collections:
        coll_path = os.path.join(backup_dir, f"{coll}.json")
        if os.path.exists(coll_path):
            with open(coll_path, "r", encoding="utf-8") as f:
                items = json.load(f)
            print(f"Uploading {len(items)} items to collection '{coll}'...")
            batch = db.batch()
            count = 0
            for item in items:
                doc_id = item.get("id")
                if not doc_id:
                    print(f"Warning: Item in {coll} has no id field, skipping.")
                    continue
                doc_ref = db.collection(coll).document(str(doc_id))
                batch.set(doc_ref, item)
                count += 1
                if count % 400 == 0:
                    batch.commit()
                    batch = db.batch()
            batch.commit()
            print(f"Uploaded collection '{coll}' successfully.")

if __name__ == "__main__":
    main()
