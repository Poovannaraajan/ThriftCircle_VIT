from datetime import datetime, timezone
from sqlalchemy import update

def expire_old_listings(app):
    from app import db
    from app.models.listing import Listing
    
    with app.app_context():
        result = db.session.execute(
            update(Listing)
            .where(Listing.status == "active")
            .where(Listing.expires_at < datetime.now(timezone.utc))
            .values(status="expired")
        )
        db.session.commit()
        print(f"[expiry job] Expired {result.rowcount} listings")
