import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app, db
from app.models.category import Category

CATEGORIES = [
    {"name": "Books & Notes",     "slug": "books",       "icon": "📚"},
    {"name": "Electronics",       "slug": "electronics", "icon": "💻"},
    {"name": "Clothes & Fashion", "slug": "clothes",     "icon": "👕"},
    {"name": "Lab Equipment",     "slug": "lab",         "icon": "🔬"},
    {"name": "Sports & Fitness",  "slug": "sports",      "icon": "🏋️"},
    {"name": "Cycles & Vehicles", "slug": "vehicles",    "icon": "🚲"},
    {"name": "Food & Groceries",  "slug": "food",        "icon": "🍱"},
    {"name": "Furniture",         "slug": "furniture",   "icon": "🛋️"},
    {"name": "Other",             "slug": "other",       "icon": "📦"},
]

def seed_categories():
    app = create_app("development")
    with app.app_context():
        added = 0
        for cat_data in CATEGORIES:
            existing = Category.query.filter_by(slug=cat_data["slug"]).first()
            if not existing:
                cat = Category(**cat_data)
                db.session.add(cat)
                added += 1
        
        db.session.commit()
        print(f"Seeded {added} categories")

if __name__ == "__main__":
    seed_categories()
