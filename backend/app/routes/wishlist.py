from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from sqlalchemy.exc import IntegrityError
from app import db, limiter
from app.models.wishlist import Wishlist
from app.models.listing import Listing

wishlist_bp = Blueprint("wishlist_bp", __name__)

@wishlist_bp.route("/", methods=["GET"])
@jwt_required()
def get_wishlist():
    current_user_id = get_jwt_identity()
    
    wishlists = Wishlist.query.filter_by(user_id=current_user_id).all()
    
    own_listings = []
    other_listings = []
    expired_listings = []
    
    for item in wishlists:
        listing = item.listing
        if not listing:
            continue
            
        listing_data = listing.to_dict(include_seller=True, include_contact=True)
        
        if listing.status in ["expired", "sold"]:
            expired_listings.append(listing_data)
        elif listing.seller_id == current_user_id:
            own_listings.append(listing_data)
        else:
            other_listings.append(listing_data)
            
    return jsonify({
        "own_listings": own_listings,
        "other_listings": other_listings,
        "expired_listings": expired_listings
    }), 200

@wishlist_bp.route("/", methods=["POST"])
@jwt_required()
@limiter.limit("60 per hour")
def add_to_wishlist():
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    if not data or "listing_id" not in data:
        return jsonify({"error": "listing_id is required"}), 422
        
    listing_id = data["listing_id"]
    
    listing = Listing.query.get(listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
        
    try:
        new_item = Wishlist(user_id=current_user_id, listing_id=listing_id)
        db.session.add(new_item)
        db.session.commit()
    except IntegrityError:
        db.session.rollback()
        return jsonify({"error": "Already in wishlist"}), 409
        
    return jsonify({"message": "Added to wishlist", "listing_id": listing_id}), 201

@wishlist_bp.route("/<string:listing_id>", methods=["DELETE"])
@jwt_required()
@limiter.limit("60 per hour")
def remove_from_wishlist(listing_id):
    current_user_id = get_jwt_identity()
    
    item = Wishlist.query.filter_by(user_id=current_user_id, listing_id=listing_id).first()
    if not item:
        return jsonify({"error": "Listing not in wishlist"}), 404
        
    db.session.delete(item)
    db.session.commit()
    
    return jsonify({"message": "Removed from wishlist"}), 200

@wishlist_bp.route("/ids", methods=["GET"])
@jwt_required()
def get_wishlist_ids():
    current_user_id = get_jwt_identity()
    
    items = Wishlist.query.filter_by(user_id=current_user_id).all()
    ids = [item.listing_id for item in items]
    
    return jsonify({"wishlist_ids": ids}), 200
