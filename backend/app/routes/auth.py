from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
import re
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from marshmallow import ValidationError
from app import db
from app.models.user import User
from app.schemas.auth_schemas import PhoneSchema

auth_bp = Blueprint("auth_bp", __name__)

@auth_bp.route("/google", methods=["POST"])
def google_login():
    data = request.get_json()
    credential = data.get("credential")

    if not credential:
        return jsonify({"error": "Missing credential"}), 400

    try:
        payload = id_token.verify_oauth2_token(
            credential,
            google_requests.Request(),
            current_app.config["GOOGLE_CLIENT_ID"],
            clock_skew_in_seconds=10
        )
    except ValueError as e:
        print(f"Token validation error: {e}")
        return jsonify({"error": f"Invalid token: {str(e)}"}), 401

    if payload.get("hd") != "vitstudent.ac.in":
        return jsonify({"error": "Only vitstudent.ac.in accounts are allowed"}), 403

    google_id = payload.get("sub")
    email = payload.get("email")
    name = payload.get("name")
    avatar_url = payload.get("picture")

    reg_no = None
    if name:
        match = re.search(r'\s([0-9]{2}[A-Za-z]{3}[0-9]{4})$', name)
        if match:
            reg_no = match.group(1).upper()
            name = name[:match.start()].strip()

    user = User.query.filter_by(google_id=google_id).first()

    if user:
        user.name = name
        user.avatar_url = avatar_url
        if reg_no:
            user.reg_no = reg_no
    else:
        user = User(
            google_id=google_id,
            email=email,
            name=name,
            reg_no=reg_no,
            avatar_url=avatar_url
        )
        db.session.add(user)

    db.session.commit()

    access_token = create_access_token(identity=user.id)
    return jsonify({
        "access_token": access_token,
        "user": user.to_dict()
    }), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def get_me():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404
        
    return jsonify(user.to_dict()), 200


@auth_bp.route("/me/phone", methods=["PATCH"])
@jwt_required()
def update_phone():
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user:
        return jsonify({"error": "User not found"}), 404

    data = request.get_json()
    schema = PhoneSchema()
    
    try:
        validated_data = schema.load(data)
    except ValidationError as err:
        return jsonify({"error": err.messages}), 422
        
    user.phone_number = validated_data["phone_number"]
    db.session.commit()
    
    return jsonify(user.to_dict()), 200
