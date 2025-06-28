import os

file_to_delete = r'E:\My Projects  p\basic portfolio\update 2025\New folder\my-portfolio\delete_blog_dir.py'

if os.path.exists(file_to_delete):
    os.remove(file_to_delete)
    print(f"Successfully deleted: {file_to_delete}")
else:
    print(f"File not found: {file_to_delete}")
