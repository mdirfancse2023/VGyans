import os
import sys
import json
import subprocess

os.environ["GRPC_DNS_RESOLVER"] = "native"

print("Extracting 350 questions from commit 1804f64d8d656b8d04085b00832732c64362e0d7...")
try:
    raw_data = subprocess.check_output([
        "git", "show", "1804f64d8d656b8d04085b00832732c64362e0d7:backend/data/backup/playground_questions.json"
    ])
    full_questions = json.loads(raw_data)
    print(f"Successfully extracted {len(full_questions)} questions!")
except Exception as e:
    print(f"Error extracting questions from commit: {e}")
    sys.exit(1)

# 1. Build lightweight questions list containing only id, title, difficulty, category
lightweight_questions = []
for q in full_questions:
    lightweight_questions.append({
        "id": q["id"],
        "title": q["title"],
        "difficulty": q["difficulty"],
        "category": q["category"]
    })

target_path = "frontend/src/data/questions.json"
os.makedirs(os.path.dirname(target_path), exist_ok=True)
with open(target_path, "w", encoding="utf-8") as f:
    json.dump(lightweight_questions, f, indent=2, ensure_ascii=False)
print(f"Saved lightweight questions list ({len(lightweight_questions)} items) to: {target_path}")

# 3. Upload full detailed documents to Firebase Firestore collection `playground_questions`
print("\nConnecting to Firebase Firestore...")
try:
    import firebase_admin
    from firebase_admin import credentials, firestore

    if not firebase_admin._apps:
        key_path = "backend/serviceAccountKey.json"
        if os.path.exists(key_path):
            cred = credentials.Certificate(key_path)
            firebase_admin.initialize_app(cred)
            print("Firebase initialized using serviceAccountKey.json.")
        else:
            firebase_admin.initialize_app()
            print("Firebase initialized using default credentials.")

    db = firestore.client()
    print(f"Uploading {len(full_questions)} question documents to Firestore 'playground_questions' collection...")

    batch = db.batch()
    count = 0
    total_uploaded = 0

    for q in full_questions:
        doc_ref = db.collection("playground_questions").document(q["id"])
        batch.set(doc_ref, q)
        count += 1
        total_uploaded += 1
        if count % 400 == 0:
            batch.commit()
            batch = db.batch()
            print(f"Committed batch of {count} documents...")
            count = 0

    if count > 0:
        batch.commit()
        print(f"Committed final batch of {count} documents...")

    print(f"\n🎉 Successfully uploaded all {total_uploaded} question details to Firebase Firestore 'playground_questions' collection!")
except Exception as e:
    print(f"Warning: Failed to upload questions to Firestore: {e}")
