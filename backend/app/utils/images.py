import os
import uuid
import cloudinary
import cloudinary.uploader
from PIL import Image

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

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

        import io
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='JPEG', quality=85, optimize=True)
        img_byte_arr.seek(0)
        
        result = cloudinary.uploader.upload(
            img_byte_arr,
            folder="thriftcircle"
        )
        return result["secure_url"]
        
    except Exception as e:
        print(f"Error saving image: {e}")
        return None
