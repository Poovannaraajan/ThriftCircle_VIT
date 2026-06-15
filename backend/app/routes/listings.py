import os
from flask import Blueprint, request, jsonify, current_app, send_from_directory
from flask_jwt_extended import jwt_required, get_jwt_identity
from marshmallow import ValidationError
from sqlalchemy import text, func
from app import db
from app.models.listing import Listing
from app.models.category import Category
from app.models.user import User
from app.schemas.listing_schemas import CreateListingSchema, ListingFilterSchema
from app.utils.images import save_listing_image, MAX_IMAGES_PER_LISTING
from app import limiter
import bleach

listings_bp = Blueprint("listings_bp", __name__)

@listings_bp.route("/categories", methods=["GET"])
def get_categories():
    categories = Category.query.order_by(Category.name).all()
    return jsonify([c.to_dict() for c in categories]), 200

@listings_bp.route("/my", methods=["GET"])
@jwt_required()
def get_my_listings():
    current_user_id = get_jwt_identity()
    listings = Listing.query.filter_by(seller_id=current_user_id).order_by(Listing.created_at.desc()).all()
    return jsonify([listing.to_dict(include_seller=True, include_contact=True) for listing in listings]), 200

@listings_bp.route("/uploads/<filename>", methods=["GET"])
def get_upload(filename):
    uploads_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
    return send_from_directory(uploads_dir, filename)

@listings_bp.route("/<string:listing_id>/status", methods=["PATCH"])
@jwt_required()
def update_listing_status(listing_id):
    current_user_id = get_jwt_identity()
    new_status = request.json.get("status") if request.json else None
    
    allowed_statuses = ["active", "reserved", "sold", "expired"]
    if new_status not in allowed_statuses:
        return jsonify({"error": f"Invalid status. Must be one of: {', '.join(allowed_statuses)}"}), 422
        
    listing = Listing.query.get(listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
        
    if listing.seller_id != current_user_id:
        return jsonify({"error": "You can only modify your own listings"}), 403
        
    if listing.status == "sold":
        return jsonify({"error": "Listing is sold and cannot be modified"}), 422
        
    valid_transitions = {
        "active": ["reserved", "expired"],
        "reserved": ["active", "sold"],
        "expired": ["active"]
    }
    
    if new_status not in valid_transitions.get(listing.status, []):
        return jsonify({"error": f"Cannot transition from {listing.status} to {new_status}"}), 422
        
    listing.status = new_status
    db.session.commit()
    
    return jsonify(listing.to_dict(include_seller=True, include_contact=True)), 200

@listings_bp.route("/<string:listing_id>", methods=["GET"])
@jwt_required(optional=True)
def get_listing(listing_id):
    listing = Listing.query.get(listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
        
    current_user_id = get_jwt_identity()
    include_contact = current_user_id is not None
    
    return jsonify(listing.to_dict(include_seller=True, include_contact=include_contact)), 200

@listings_bp.route("/", methods=["POST"])
@jwt_required()
@limiter.limit("20 per hour")
def create_listing():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    if not user.phone_number:
        return jsonify({"error": "Phone number required before creating a listing"}), 403
        
    form_data = request.form.to_dict()
    schema = CreateListingSchema()
    
    try:
        validated_data = schema.load(form_data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 422
        
    validated_data["title"] = bleach.clean(validated_data["title"]).strip()
    if not validated_data["title"]:
        return jsonify({"error": "Title cannot be blank"}), 422
        
    if validated_data.get("description"):
        validated_data["description"] = bleach.clean(validated_data["description"]).strip()
        
    category = Category.query.get(validated_data["category_id"])
    if not category:
        return jsonify({"error": "Invalid category"}), 422
        
    images = request.files.getlist("images")
    saved_paths = []
    
    for img in images[:MAX_IMAGES_PER_LISTING]:
        if img.filename:
            path = save_listing_image(img)
            if path:
                saved_paths.append(path)
                
    image_urls = ",".join(saved_paths) if saved_paths else None
    
    listing = Listing(
        seller_id=current_user_id,
        category_id=validated_data["category_id"],
        title=validated_data["title"],
        description=validated_data.get("description"),
        price=validated_data.get("price"),
        listing_type=validated_data["listing_type"],
        condition=validated_data.get("condition"),
        image_urls=image_urls
    )
    
    db.session.add(listing)
    db.session.commit()
    
    return jsonify(listing.to_dict(include_seller=True, include_contact=True)), 201

@listings_bp.route("/", methods=["GET"])
@jwt_required(optional=True)
def get_listings():
    args = request.args.to_dict()
    schema = ListingFilterSchema()
    
    try:
        params = schema.load(args)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 422
        
    query = Listing.query.filter_by(status=params["status"])
    
    if params.get("category_id"):
        query = query.filter_by(category_id=params["category_id"])
        
    if params.get("listing_type"):
        query = query.filter_by(listing_type=params["listing_type"])
        
    if params.get("min_price") is not None:
        query = query.filter(Listing.price >= params["min_price"])
        
    if params.get("max_price") is not None:
        query = query.filter(Listing.price <= params["max_price"])
        
    if params.get("q"):
        search_vector = text("to_tsvector('english', coalesce(listings.title,'') || ' ' || coalesce(listings.description,''))")
        search_query = func.plainto_tsquery('english', params["q"])
        query = query.filter(search_vector.op('@@')(search_query))
        
    query = query.order_by(Listing.created_at.desc())
    
    page = params["page"]
    per_page = params["per_page"]
    paginated = query.paginate(page=page, per_page=per_page, error_out=False)
    
    current_user_id = get_jwt_identity()
    include_contact = current_user_id is not None
    
    listings = [l.to_dict(include_seller=True, include_contact=include_contact) for l in paginated.items]
    
    return jsonify({
        "listings": listings,
        "total": paginated.total,
        "page": paginated.page,
        "per_page": paginated.per_page,
        "pages": paginated.pages,
        "has_next": paginated.has_next,
        "has_prev": paginated.has_prev
    }), 200

@listings_bp.route("/<string:listing_id>", methods=["PUT"])
@jwt_required()
@limiter.limit("20 per hour")
def update_listing(listing_id):
    current_user_id = get_jwt_identity()
    
    listing = Listing.query.get(listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
        
    if listing.seller_id != current_user_id:
        return jsonify({"error": "You can only edit your own listings"}), 403
        
    form_data = request.get_json()
    schema = CreateListingSchema()
    
    try:
        validated_data = schema.load(form_data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 422
        
    validated_data["title"] = bleach.clean(validated_data["title"]).strip()
    if not validated_data["title"]:
        return jsonify({"error": "Title cannot be blank"}), 422
        
    if validated_data.get("description"):
        validated_data["description"] = bleach.clean(validated_data["description"]).strip()
        
    category = Category.query.get(validated_data["category_id"])
    if not category:
        return jsonify({"error": "Invalid category"}), 422

    listing.title = validated_data["title"]
    listing.description = validated_data.get("description")
    listing.price = validated_data.get("price")
    listing.listing_type = validated_data["listing_type"]
    listing.condition = validated_data.get("condition")
    listing.category_id = validated_data["category_id"]
    
    db.session.commit()
    
    return jsonify(listing.to_dict(include_seller=True, include_contact=True)), 200

@listings_bp.route("/<string:listing_id>", methods=["DELETE"])
@jwt_required()
def delete_listing(listing_id):
    current_user_id = get_jwt_identity()
    
    listing = Listing.query.get(listing_id)
    if not listing:
        return jsonify({"error": "Listing not found"}), 404
        
    if listing.seller_id != current_user_id:
        return jsonify({"error": "You can only delete your own listings"}), 403
        
    # Optional: Delete images from disk
    if listing.image_urls:
        urls = listing.image_urls.split(",")
        uploads_dir = os.path.abspath(os.path.join(current_app.root_path, '..', 'uploads'))
        for url in urls:
            filename = url.split("/")[-1]
            filepath = os.path.join(uploads_dir, filename)
            if os.path.exists(filepath):
                try:
                    os.remove(filepath)
                except Exception as e:
                    print(f"Failed to delete image {filepath}: {e}")

    db.session.delete(listing)
    db.session.commit()
    
    return jsonify({"message": "Listing deleted successfully"}), 200
