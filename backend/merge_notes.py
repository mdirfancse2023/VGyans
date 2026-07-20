import json
import os

backup_path = '/Users/macbook/Documents/June/VGyans/backend/data/backup/notes.json'
with open(backup_path, 'r', encoding='utf-8') as f:
    notes = json.load(f)

# Save to frontend public/data (full version)
with open('/Users/macbook/Documents/June/VGyans/frontend/public/data/notes.json', 'w', encoding='utf-8') as f:
    json.dump(notes, f, indent=2, ensure_ascii=False)

# Save to backend data (full version)
with open('/Users/macbook/Documents/June/VGyans/backend/data/notes.json', 'w', encoding='utf-8') as f:
    json.dump(notes, f, indent=2, ensure_ascii=False)

print("Notes restored successfully from backup! Total notes count:", len(notes))
