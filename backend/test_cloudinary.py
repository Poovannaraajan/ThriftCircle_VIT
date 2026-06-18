import os
from dotenv import load_dotenv
import cloudinary
import cloudinary.uploader
import io
from PIL import Image

load_dotenv()

cloudinary.config(
    cloud_name=os.getenv('CLOUDINARY_CLOUD_NAME'),
    api_key=os.getenv('CLOUDINARY_API_KEY'),
    api_secret=os.getenv('CLOUDINARY_API_SECRET')
)

try:
    print("Testing upload...")
    img = Image.new('RGB', (100, 100), color='red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_byte_arr.seek(0)
    
    # Try passing BytesIO
    result = cloudinary.uploader.upload(img_byte_arr, folder="thriftcircle")
    print("Upload successful:", result.get("secure_url"))
except Exception as e:
    print("Error during upload:", str(e))
