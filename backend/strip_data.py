import json
import os

def strip_file(file_path):
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return
        
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)
        
    stripped = {}
    
    # 1. channel: keep all
    if "channel" in data:
        stripped["channel"] = data["channel"]
        
    # 2. playlists: keep id, title, videoCount
    if "playlists" in data:
        stripped["playlists"] = [
            {"id": p.get("id"), "title": p.get("title"), "videoCount": p.get("videoCount")}
            for p in data["playlists"]
        ]
        
    # 3. videos: keep id, title, category, views, duration
    if "videos" in data:
        stripped["videos"] = [
            {
                "id": v.get("id"),
                "title": v.get("title"),
                "category": v.get("category"),
                "views": v.get("views"),
                "duration": v.get("duration")
            }
            for v in data["videos"]
        ]
        
    # 4. resources: keep id, title, category
    if "resources" in data:
        stripped["resources"] = [
            {"id": r.get("id"), "title": r.get("title"), "category": r.get("category")}
            for r in data["resources"]
        ]
        
    # 5. experiences: keep id, title, company, role, status
    if "experiences" in data:
        stripped["experiences"] = [
            {
                "id": e.get("id"),
                "title": e.get("title"),
                "company": e.get("company"),
                "role": e.get("role"),
                "status": e.get("status")
            }
            for e in data["experiences"]
        ]
        
    # 6. flashcards: keep id, title, category
    if "flashcards" in data:
        stripped["flashcards"] = [
            {"id": f.get("id"), "title": f.get("title"), "category": f.get("category")}
            for f in data["flashcards"]
        ]
        
    # 7. onboardingStages: keep keys only
    if "onboardingStages" in data:
        stripped["onboardingStages"] = {company: [] for company in data["onboardingStages"]}
        
    # 8. notes: keep id, title
    if "notes" in data:
        stripped["notes"] = [
            {"id": n.get("id"), "title": n.get("title")}
            for n in data["notes"]
        ]
        
    # 9. playground_questions: keep id, title, difficulty, category
    if "playground_questions" in data:
        stripped["playground_questions"] = data["playground_questions"]
        
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(stripped, f, indent=2)
    print(f"Stripped and saved lightweight file to: {file_path}")

if __name__ == "__main__":
    strip_file("backend/data/data.json")
    strip_file("frontend/public/data.json")
