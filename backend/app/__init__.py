import os
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from flask_cors import CORS

db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
cors = CORS()

def create_app(config_name="development"):
    app = Flask(__name__)
    
    if config_name == "development":
        app.config.from_object("app.config.DevelopmentConfig")
    else:
        app.config.from_object("app.config.ProductionConfig")
        
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    cors.init_app(app, resources={r"/api/*": {"origins": "*"}})
    
    from app.routes.auth import auth_bp
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    
    from app.routes.listings import listings_bp
    app.register_blueprint(listings_bp, url_prefix="/api/listings")
    
    uploads_dir = os.path.join(app.root_path, '..', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    
    @app.route("/api/health", methods=["GET"])
    def health():
        return jsonify({"status": "ok"})
        
    with app.app_context():
        from app import models
        
    return app
