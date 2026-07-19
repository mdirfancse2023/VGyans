import requests
import json

def test():
    folder_id = "Pw5Fja7R"
    # Mega public API endpoint for folder listings
    url = f"https://g.api.mega.co.nz/cs?id=0&n={folder_id}"
    
    # Payload requesting the list of files (nodes) in the public folder
    payload = [{"a": "f", "c": 1, "r": 1}]
    
    headers = {
        "Content-Type": "application/json"
    }
    
    print(f"Querying Mega API for folder {folder_id}...")
    try:
        res = requests.post(url, data=json.dumps(payload), headers=headers)
        print(f"Status Code: {res.status_code}")
        data = res.json()
        print("Response data sample:")
        print(json.dumps(data, indent=2)[:800])
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test()
