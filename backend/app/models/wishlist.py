from app import db
import uuid
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime, timezone
from sqlalchemy import UniqueConstraint

class Wishlist(db.Model):
    __tablename__ = "wishlists"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    listing_id = db.Column(db.String(36), db.ForeignKey("listings.id", ondelete="CASCADE"), nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    __table_args__ = (
        UniqueConstraint("user_id", "listing_id", name="uq_user_listing_wishlist"),
    )

    user = db.relationship("User", back_populates="wishlists")
    listing = db.relationship("Listing", back_populates="wishlists")

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "listing_id": self.listing_id,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
