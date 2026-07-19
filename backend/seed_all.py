import os
os.environ["GRPC_DNS_RESOLVER"] = "native"
import json
import firebase_admin
from firebase_admin import credentials, firestore

def main():
    data_path = "backend/data/data_full_backup.json"
    if not os.path.exists(data_path):
        print(f"Error: {data_path} not found.")
        return
        
    with open(data_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
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
    if "channel" in data:
        print("Uploading channel stats...")
        db.collection("channel").document("stats").set(data["channel"])
        print("Uploaded channel stats successfully.")
        
    # 2. Upload Onboarding Stages
    if "onboardingStages" in data:
        print("Uploading onboarding stages...")
        stages = data["onboardingStages"]
        for company, stages_list in stages.items():
            db.collection("onboardingStages").document(company).set({"stages": stages_list})
        print("Uploaded onboarding stages successfully.")
        
    # 3. Upload other collections
    collections = ["playlists", "videos", "resources", "experiences", "flashcards", "notes"]
    for coll in collections:
        if coll in data:
            items = data[coll]
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
