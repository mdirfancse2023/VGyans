import json
import os

def strip_and_save():
    backup_dir = "backend/data/backup"
    backend_data_dir = "backend/data"
    frontend_data_dir = "frontend/public/data"
    
    os.makedirs(backend_data_dir, exist_ok=True)
    os.makedirs(frontend_data_dir, exist_ok=True)
    
    keys = ["channel", "playlists", "videos", "resources", "experiences", "flashcards", "onboardingStages", "notes", "playground_questions"]
    
    for key in keys:
        backup_path = os.path.join(backup_dir, f"{key}.json")
        if not os.path.exists(backup_path):
            print(f"Warning: Backup {backup_path} not found.")
            continue
            
        with open(backup_path, "r", encoding="utf-8") as f:
            data = json.load(f)
            
        # Perform minification based on key
        if key == "channel":
            stripped = data
        elif key == "playlists":
            stripped = [
                {"id": p.get("id"), "title": p.get("title"), "videoCount": p.get("videoCount")}
                for p in data
            ]
        elif key == "videos":
            stripped = [
                {
                    "id": v.get("id"),
                    "title": v.get("title"),
                    "thumbnailUrl": v.get("thumbnailUrl") or f"https://i.ytimg.com/vi/{v.get('id')}/hqdefault.jpg",
                    "videoUrl": v.get("videoUrl") or f"https://www.youtube.com/watch?v={v.get('id')}",
                    "publishedAt": v.get("publishedAt"),
                    "category": v.get("category"),
                    "views": v.get("views"),
                    "duration": v.get("duration")
                }
                for v in data
            ]
        elif key == "resources":
            stripped = data
        elif key == "experiences":
            stripped = [
                {
                    "id": e.get("id"),
                    "company": e.get("company"),
                    "role": e.get("role"),
                    "verdict": e.get("verdict"),
                    "candidate": e.get("candidate"),
                    "date": e.get("date"),
                    "difficulty": e.get("difficulty"),
                    "tips": e.get("tips")
                }
                for e in data
            ]
        elif key == "flashcards":
            stripped = [
                {"id": f.get("id"), "title": f.get("title"), "category": f.get("category")}
                for f in data
            ]
        elif key == "onboardingStages":
            stripped = {company: [] for company in data}
        elif key == "notes":
            stripped = [
                {"id": n.get("id"), "title": n.get("title")}
                for n in data
            ]
        elif key == "playground_questions":
            stripped = data
            
        # Write backend minified JSON
        with open(os.path.join(backend_data_dir, f"{key}.json"), "w", encoding="utf-8") as f:
            json.dump(stripped, f, indent=2, ensure_ascii=False)
            
        # Write frontend minified JSON
        with open(os.path.join(frontend_data_dir, f"{key}.json"), "w", encoding="utf-8") as f:
            json.dump(stripped, f, indent=2, ensure_ascii=False)
            
    # Copy full playground backup to frontend public static backup folder for instant fallback
    frontend_backup_dir = "frontend/public/data/backup"
    os.makedirs(frontend_backup_dir, exist_ok=True)
    if os.path.exists("backend/data/backup/playground_questions.json"):
        with open("backend/data/backup/playground_questions.json", "r", encoding="utf-8") as f_in:
            backup_questions = json.load(f_in)
        with open(os.path.join(frontend_backup_dir, "playground_questions.json"), "w", encoding="utf-8") as f_out:
            json.dump(backup_questions, f_out, indent=2, ensure_ascii=False)

    print("Minification complete! All segregated files updated successfully.")

if __name__ == "__main__":
    strip_and_save()
