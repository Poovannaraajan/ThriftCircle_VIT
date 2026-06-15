import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from marshmallow import ValidationError
from sqlalchemy.exc import IntegrityError

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()
limiter = Limiter(key_func=get_remote_address, default_limits=[])

def create_app(config_name="development"):
    app = Flask(__name__)
    
    if config_name == "development":
        app.config.from_object("app.config.DevelopmentConfig")
    else:
        app.config.from_object("app.config.ProductionConfig")
        
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    
    allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
    cors.init_app(app, resources={r"/api/*": {"origins": allowed_origins}})
    
    limiter.init_app(app)
    
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    
    from app.routes.listings import listings_bp
    app.register_blueprint(listings_bp, url_prefix="/api/listings")
    
    uploads_dir = os.path.join(app.root_path, '..', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})
        
    # Standard Error Handlers
    @app.errorhandler(400)
    def handle_400(e):
        return jsonify({"error": "Bad request", "status_code": 400}), 400

    @app.errorhandler(401)
    def handle_401(e):
        return jsonify({"error": "Authentication required", "status_code": 401}), 401

    @app.errorhandler(403)
    def handle_403(e):
        return jsonify({"error": "Access denied", "status_code": 403}), 403

    @app.errorhandler(404)
    def handle_404(e):
        return jsonify({"error": "Resource not found", "status_code": 404}), 404

    @app.errorhandler(405)
    def handle_405(e):
        return jsonify({"error": "Method not allowed", "status_code": 405}), 405

    @app.errorhandler(422)
    def handle_422(e):
        return jsonify({"error": "Validation error", "status_code": 422}), 422

    @app.errorhandler(429)
    def handle_429(e):
        return jsonify({"error": "Too many requests. Please slow down.", "status_code": 429}), 429

    @app.errorhandler(500)
    def handle_500(e):
        return jsonify({"error": "Internal server error", "status_code": 500}), 500

    @app.errorhandler(ValidationError)
    def handle_marshmallow_error(err):
        return jsonify({
            "error": "Validation failed",
            "messages": err.messages,
            "status_code": 422
        }), 422

    @app.errorhandler(IntegrityError)
    def handle_integrity_error(err):
        db.session.rollback()
        return jsonify({
            "error": "A conflict occurred. This record may already exist.",
            "status_code": 409
        }), 409
        
    with app.app_context():
        from app import models
        
    from apscheduler.schedulers.background import BackgroundScheduler
    from app.jobs.expiry import expire_old_listings

    scheduler = BackgroundScheduler()
    scheduler.add_job(
        func=expire_old_listings,
        args=[app],
        trigger="cron",
        hour=0,
        minute=0,
        id="expire_listings",
        replace_existing=True,
    )
    if not app.config.get("TESTING"):
        scheduler.start()
        
    return app
