import uuid
from datetime import datetime, timezone
from app import db

class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    google_id = db.Column(db.String(120), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    name = db.Column(db.String(120), nullable=False)
    reg_no = db.Column(db.String(20), nullable=True)
    avatar_url = db.Column(db.String(500), nullable=True)
    phone_number = db.Column(db.String(20), nullable=True)
    trust_score = db.Column(db.Float, default=5.0)
    created_at = db.Column(db.DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    listings = db.relationship("Listing", back_populates="seller", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "google_id": self.google_id,
            "email": self.email,
            "name": self.name,
            "reg_no": self.reg_no,
            "avatar_url": self.avatar_url,
            "phone_number": self.phone_number,
            "trust_score": self.trust_score,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
