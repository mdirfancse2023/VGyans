import requests
import json
from mega.crypto import base64_to_a32, decrypt_key, base64_url_decode, decrypt_attr, str_to_a32

def test_decrypt():
    # Folder ID and Key from: https://mega.nz/folder/Pw5Fja7R#2D5gvXNs5oXZzOZz6jGqyA
    folder_id = "Pw5Fja7R"
    folder_key_str = "2D5gvXNs5oXZzOZz6jGqyA"
    
    # 1. Convert the base64 folder key to a32 format
    shared_key = base64_to_a32(folder_key_str)
    
    # 2. Query Mega API
    url = f"https://g.api.mega.co.nz/cs?id=0&n={folder_id}"
    payload = [{"a": "f", "c": 1, "r": 1}]
    headers = {"Content-Type": "application/json"}
    
    res = requests.post(url, data=json.dumps(payload), headers=headers)
    response_data = res.json()
    
    # 3. Decrypt files
    files = response_data[0].get("f", [])
    print(f"Total nodes found in folder: {len(files)}")
    
    for f in files:
        # Check if the node has key info 'k' and attributes 'a'
        k_str = f.get("k", "")
        a_str = f.get("a", "")
        if not k_str or not a_str:
            continue
            
        try:
            # Parse the encrypted key from 'k' (format: "node_id:encrypted_key")
            encrypted_key_str = k_str.split(":")[-1]
            encrypted_key = str_to_a32(base64_url_decode(encrypted_key_str))
            
            # Decrypt the key using our shared folder key
            key = decrypt_key(encrypted_key, shared_key)
            
            # Formulate the decryption key 'k' based on node type (0=file, 1=folder)
            if f.get("t") == 0:
                k = (key[0] ^ key[4], key[1] ^ key[5], key[2] ^ key[6], key[3] ^ key[7])
            else:
                k = key
                
            # Decrypt attributes
            attributes = base64_url_decode(a_str)
            attributes = decrypt_attr(attributes, k)
            
            if attributes:
                print(f"Name: {attributes.get('n')}")
                print(f"  Type: {'File' if f.get('t') == 0 else 'Folder'}")
                print(f"  Node ID: {f.get('h')}")
                # Direct download URL for public files is: https://mega.nz/file/{node_id}#{decrypted_node_key}
                # But wait, direct download format in Mega requires the file key.
                # Let's print out the file info.
        except Exception as e:
            print(f"Failed to decrypt node {f.get('h')}: {e}")

if __name__ == "__main__":
    test_decrypt()
