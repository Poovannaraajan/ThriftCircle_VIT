import os
import uuid
from PIL import Image

ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'webp'}
MAX_IMAGES_PER_LISTING = 4

def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_listing_image(file_storage) -> str | None:
    if not file_storage or not file_storage.filename or not allowed_file(file_storage.filename):
        return None

    try:
        img = Image.open(file_storage.stream)

        # Convert RGBA/palette to RGB
        if img.mode in ('RGBA', 'P'):
            img = img.convert('RGB')

        # Resize if longest edge > 800px
        max_size = 800
        if max(img.size) > max_size:
            img.thumbnail((max_size, max_size), Image.LANCZOS)

        filename = f"{uuid.uuid4().hex}.jpg"
        
        # Resolve uploads directory relative to this file
        current_dir = os.path.dirname(os.path.abspath(__file__))
        uploads_dir = os.path.abspath(os.path.join(current_dir, '..', '..', 'uploads'))
        
        # Ensure directory exists
        os.makedirs(uploads_dir, exist_ok=True)
        
        filepath = os.path.join(uploads_dir, filename)
        
        img.save(filepath, "JPEG", quality=85, optimize=True)
        
        return f"uploads/{filename}"
        
    except Exception as e:
        print(f"Error saving image: {e}")
        return None
