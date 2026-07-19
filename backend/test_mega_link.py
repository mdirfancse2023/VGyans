import requests
import json
from mega.crypto import base64_to_a32, decrypt_key, base64_url_decode, decrypt_attr, str_to_a32, a32_to_base64

def generate_links():
    folder_id = "Pw5Fja7R"
    folder_key_str = "2D5gvXNs5oXZzOZz6jGqyA"
    
    shared_key = base64_to_a32(folder_key_str)
    
    url = f"https://g.api.mega.co.nz/cs?id=0&n={folder_id}"
    payload = [{"a": "f", "c": 1, "r": 1}]
    headers = {"Content-Type": "application/json"}
    
    res = requests.post(url, data=json.dumps(payload), headers=headers)
    response_data = res.json()
    files = response_data[0].get("f", [])
    
    for f in files:
        k_str = f.get("k", "")
        a_str = f.get("a", "")
        if not k_str or not a_str or f.get("t") != 0: # Files only
            continue
            
        try:
            encrypted_key_str = k_str.split(":")[-1]
            encrypted_key = str_to_a32(base64_url_decode(encrypted_key_str))
            key = decrypt_key(encrypted_key, shared_key)
            
            # Encrypted attributes key
            k = (key[0] ^ key[4], key[1] ^ key[5], key[2] ^ key[6], key[3] ^ key[7])
            
            attributes = base64_url_decode(a_str)
            attributes = decrypt_attr(attributes, k)
            
            # The public download URL for a file in a shared folder uses the node ID and its decrypted 32-byte key
            file_key_b64 = a32_to_base64(key)
            download_url = f"https://mega.nz/file/{f.get('h')}#{file_key_b64}"
            
            print(f"File Name: {attributes.get('n')}")
            print(f"Generated Link: {download_url}")
        except Exception as e:
            print(f"Error: {e}")

if __name__ == "__main__":
    generate_links()
