import uuid
from datetime import datetime, timezone, timedelta
from sqlalchemy import Index, text
from app import db

class Listing(db.Model):
    __tablename__ = "listings"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    seller_id = db.Column(db.String(36), db.ForeignKey("users.id"), nullable=False)
    category_id = db.Column(db.Integer, db.ForeignKey("categories.id"), nullable=False)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    price = db.Column(db.Numeric(10, 2), nullable=True)
    listing_type = db.Column(db.String(10), nullable=False, default="sell")
    condition = db.Column(db.String(20), nullable=True)
    status = db.Column(db.String(20), nullable=False, default="active")
    image_urls = db.Column(db.Text, nullable=True)
    expires_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc) + timedelta(days=30))
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    seller = db.relationship("User", back_populates="listings")
    category = db.relationship("Category", back_populates="listings")

    __table_args__ = (
        Index(
            "ix_listings_fts",
            text("to_tsvector('english', coalesce(title,'') || ' ' || coalesce(description,''))"),
            postgresql_using="gin",
        ),
    )

    @property
    def image_url_list(self):
        if not self.image_urls:
            return []
        return [url.strip() for url in self.image_urls.split(",")]

    def to_dict(self, include_seller=False, include_contact=False):
        data = {
            "id": self.id,
            "seller_id": self.seller_id,
            "category_id": self.category_id,
            "title": self.title,
            "description": self.description,
            "price": float(self.price) if self.price is not None else None,
            "listing_type": self.listing_type,
            "condition": self.condition,
            "status": self.status,
            "image_urls": self.image_url_list,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

        if include_seller and self.seller:
            seller_data = {
                "id": self.seller.id,
                "name": self.seller.name,
                "trust_score": self.seller.trust_score,
                "avatar_url": self.seller.avatar_url
            }
            if include_contact:
                seller_data["email"] = self.seller.email
                seller_data["phone_number"] = self.seller.phone_number
            data["seller"] = seller_data

        return data
