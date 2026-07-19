import json
import os

def segregate():
    # Read full backup
    full_backup_path = "backend/data/data_full_backup.json"
    if not os.path.exists(full_backup_path):
        print(f"Error: {full_backup_path} not found.")
        return
        
    with open(full_backup_path, "r", encoding="utf-8") as f:
        full_data = json.load(f)
        
    # Read minified data
    min_data_path = "backend/data/data.json"
    if not os.path.exists(min_data_path):
        print(f"Error: {min_data_path} not found.")
        return
        
    with open(min_data_path, "r", encoding="utf-8") as f:
        min_data = json.load(f)
        
    # Define directories
    backend_data_dir = "backend/data"
    backend_backup_dir = "backend/data/backup"
    frontend_data_dir = "frontend/public/data"
    
    os.makedirs(backend_data_dir, exist_ok=True)
    os.makedirs(backend_backup_dir, exist_ok=True)
    os.makedirs(frontend_data_dir, exist_ok=True)
    
    keys = ["channel", "playlists", "videos", "resources", "experiences", "flashcards", "onboardingStages", "notes", "playground_questions"]
    
    for key in keys:
        # Save full backup JSON
        if key in full_data:
            with open(os.path.join(backend_backup_dir, f"{key}.json"), "w", encoding="utf-8") as f:
                json.dump(full_data[key], f, indent=2)
                
        # Save minified backend JSON
        if key in min_data:
            with open(os.path.join(backend_data_dir, f"{key}.json"), "w", encoding="utf-8") as f:
                json.dump(min_data[key], f, indent=2)
                
        # Save minified frontend JSON
        if key in min_data:
            with open(os.path.join(frontend_data_dir, f"{key}.json"), "w", encoding="utf-8") as f:
                json.dump(min_data[key], f, indent=2)
                
    print("Segregation complete! Individual JSON files created in backend/data/, backend/data/backup/, and frontend/public/data/.")

if __name__ == "__main__":
    segregate()
