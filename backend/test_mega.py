from mega import Mega

mega = Mega()
folder_url = "https://mega.nz/folder/Pw5Fja7R#2D5gvXNs5oXZzOZz6jGqyA"

try:
    print("Testing get_public_url_info...")
    info = mega.get_public_url_info(folder_url)
    print("Result:")
    print(info)
except Exception as e:
    print(f"Error: {e}")
