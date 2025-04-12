from flask import Flask
from config import Config
from app.extensions import db
from app.routes import api

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(api, url_prefix='/api')

    with app.app_context():
        db.create_all()  # Create tables if they don't exist

    return app