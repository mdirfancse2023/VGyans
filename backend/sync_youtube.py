import json
import os
os.environ["GRPC_DNS_RESOLVER"] = "native"
import re
import xml.etree.ElementTree as ET
import urllib.request
import firebase_admin
from firebase_admin import credentials, firestore

CHANNEL_HANDLE = "@virtualgyans"
CHANNEL_ID = "UCkViZeUiDCEof_t9--OgZkA"
RSS_URL = f"https://www.youtube.com/feeds/videos.xml?channel_id={CHANNEL_ID}"
CHANNEL_URL = f"https://www.youtube.com/{CHANNEL_HANDLE}"

# Initialize Firebase if credentials exist
db = None
if os.path.exists("backend/serviceAccountKey.json"):
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate("backend/serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase initialized for YouTube sync.")
    except Exception as e:
        print(f"Firebase init warning: {e}")
elif os.path.exists("serviceAccountKey.json"):
    try:
        if not firebase_admin._apps:
            cred = credentials.Certificate("serviceAccountKey.json")
            firebase_admin.initialize_app(cred)
        db = firestore.client()
        print("Firebase initialized for YouTube sync.")
    except Exception as e:
        print(f"Firebase init warning: {e}")

def categorize_video(title, description=""):
    t_lower = (title + " " + description).lower()
    if any(k in t_lower for k in ["interview", "cognizant interview", "tcs interview", "hr round", "technical round"]):
        return "Placement Prep"
    elif any(k in t_lower for k in ["cognizant", "tcs", "wipro", "infosys", "accenture", "joining", "ilp", "pra", "onboarding"]):
        return "Placement Prep"
    elif any(k in t_lower for k in ["python", "java", "c++", "cpp", "code", "leetcode", "dsa", "algorithm"]):
        return "Coding"
    elif any(k in t_lower for k in ["resume", "projects", "salary", "bench", "appraisal"]):
        return "Career"
    return "Tech Updates"

def fetch_youtube_channel_metadata():
    print(f"Fetching channel metadata from {CHANNEL_URL}...")
    req = urllib.request.Request(
        CHANNEL_URL, 
        headers={'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'}
    )
    
    subscriber_count = "2050"
    video_count = "131"
    view_count = "434958"
    description = "Welcome to Virtual Gyans - Educational & Technical Contents."
    
    import ssl
    ctx = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, timeout=4, context=ctx) as resp:
            html = resp.read().decode('utf-8')
            
            # Extract subscriber count
            subs_m = re.search(r'\"accessibilityLabel\":\"([0-9\.\,KkMmThousand]+) subscribers\"', html) or re.search(r'\"content\":\"([0-9\.\,kK]+) subscribers\"', html)
            if subs_m:
                sub_str = subs_m.group(1).replace('k', '00').replace('K', '00').replace('.', '').replace(',', '')
                subscriber_count = sub_str
                
            # Extract video count
            vids_m = re.search(r'\"content\":\"([0-9\.\,kK]+) videos\"', html)
            if vids_m:
                video_count = vids_m.group(1).replace(',', '')
                
            # Extract description
            desc_m = re.search(r'\"description\":\"([^\"]+)\"', html)
            if desc_m:
                description = desc_m.group(1).encode('utf-8').decode('unicode_escape', errors='ignore')
    except Exception as e:
        print(f"Scraping warning: {e}. Using cached fallback values.")
        
    return {
        "subscriberCount": subscriber_count,
        "viewCount": view_count,
        "videoCount": video_count,
        "avatarUrl": "/youtube-avatar.png",
        "bannerUrl": "/youtube-banner.png",
        "title": "Virtual Gyans",
        "description": description
    }

def fetch_youtube_rss_videos():
    print(f"Fetching RSS videos from {RSS_URL}...")
    req = urllib.request.Request(
        RSS_URL,
        headers={'User-Agent': 'Mozilla/5.0'}
    )
    videos = []
    import ssl
    ctx = ssl._create_unverified_context()
    try:
        with urllib.request.urlopen(req, timeout=4, context=ctx) as resp:
            xml_data = resp.read()
            root = ET.fromstring(xml_data)
            ns = {
                'atom': 'http://www.w3.org/2005/Atom',
                'yt': 'http://www.youtube.com/xml/schemas/2015',
                'media': 'http://search.yahoo.com/mrss/'
            }
            
            for entry in root.findall('atom:entry', ns):
                v_id = entry.find('yt:videoId', ns).text
                title = entry.find('atom:title', ns).text
                published_at = entry.find('atom:published', ns).text
                
                desc_elem = entry.find('media:group/media:description', ns)
                description = desc_elem.text if desc_elem is not None else ""
                
                videos.append({
                    "id": v_id,
                    "title": title,
                    "description": description or title,
                    "thumbnailUrl": f"https://i.ytimg.com/vi/{v_id}/hqdefault.jpg",
                    "publishedAt": published_at,
                    "category": categorize_video(title, description),
                    "videoUrl": f"https://www.youtube.com/watch?v={v_id}",
                    "views": "N/A",
                    "duration": "N/A"
                })
    except Exception as e:
        print(f"RSS fetch warning: {e}")
        
    return videos

def sync_all_youtube_data():
    channel_meta = fetch_youtube_channel_metadata()
    new_videos = fetch_youtube_rss_videos()
    
    # Load existing video backup to merge (so no video history is lost)
    existing_videos = []
    backup_video_path = "backend/data/backup/videos.json"
    if os.path.exists(backup_video_path):
        try:
            with open(backup_video_path, "r", encoding="utf-8") as f:
                existing_videos = json.load(f)
        except Exception:
            pass
            
    # Merge existing and new videos by video ID
    merged_videos_dict = {v["id"]: v for v in existing_videos}
    for nv in new_videos:
        merged_videos_dict[nv["id"]] = nv
        
    merged_videos = list(merged_videos_dict.values())
    # Sort videos by publishedAt descending
    merged_videos.sort(key=lambda x: x.get("publishedAt", ""), reverse=True)
    
    # 1. Save locally to backend/data/backup
    os.makedirs("backend/data/backup", exist_ok=True)
    with open("backend/data/backup/channel.json", "w", encoding="utf-8") as f:
        json.dump(channel_meta, f, indent=2, ensure_ascii=False)
    with open("backend/data/backup/videos.json", "w", encoding="utf-8") as f:
        json.dump(merged_videos, f, indent=2, ensure_ascii=False)
        
    # 2. Save minified to backend/data
    os.makedirs("backend/data", exist_ok=True)
    with open("backend/data/channel.json", "w", encoding="utf-8") as f:
        json.dump(channel_meta, f, indent=2, ensure_ascii=False)
    with open("backend/data/videos.json", "w", encoding="utf-8") as f:
        json.dump(merged_videos, f, indent=2, ensure_ascii=False)
        
    # 3. Save to frontend/public/data
    os.makedirs("frontend/public/data", exist_ok=True)
    with open("frontend/public/data/channel.json", "w", encoding="utf-8") as f:
        json.dump(channel_meta, f, indent=2, ensure_ascii=False)
    with open("frontend/public/data/videos.json", "w", encoding="utf-8") as f:
        json.dump(merged_videos, f, indent=2, ensure_ascii=False)
        
    print(f"Successfully saved {len(merged_videos)} videos and channel stats locally.")
    
    # 4. Upload to Firebase Firestore if connected
    if db is not None:
        try:
            db.collection("channel").document("stats").set(channel_meta)
            print("Uploaded channel stats to Firestore 'channel/stats'.")
            
            batch = db.batch()
            count = 0
            for vid in merged_videos:
                doc_ref = db.collection("videos").document(vid["id"])
                batch.set(doc_ref, vid)
                count += 1
                if count >= 450:
                    batch.commit()
                    batch = db.batch()
                    count = 0
            if count > 0:
                batch.commit()
            print(f"Uploaded {len(merged_videos)} videos to Firestore 'videos' collection.")
        except Exception as e:
            print(f"Firestore upload error: {e}")
            
    return {
        "channel": channel_meta,
        "videos_count": len(merged_videos),
        "videos": merged_videos
    }

if __name__ == "__main__":
    result = sync_all_youtube_data()
    print("Sync complete:", result["videos_count"], "videos synchronized.")
