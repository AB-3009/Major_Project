from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from database.db import get_db
from threading import Thread

# Import the retraining pipeline function
from services.pipeline import start_retraining_pipeline

# Initialize Flask App
app = Flask(__name__)

# App Configurations
app.config['JWT_SECRET_KEY'] = 'your_jwt_secret_key'
app.config['CORS_HEADERS'] = 'Content-Type'

# Middleware
CORS(app)
jwt = JWTManager(app)

# MongoDB Connection
get_db()

# Register Blueprints (Routes)
from routes.auth_routes import auth_bp
from routes.predict_routes import predict_bp
from routes.marketplace_routes import marketplace_bp
from routes.admin_routes import admin_bp
from routes.specialist_routes import specialist_bp
from routes.feedback_routes import feedback_bp
from routes.history_routes import history_bp
# from routes.notification_routes import notification_bp

app.register_blueprint(auth_bp, url_prefix='/auth')
app.register_blueprint(predict_bp, url_prefix='/predict')
app.register_blueprint(marketplace_bp, url_prefix='/marketplace')
app.register_blueprint(admin_bp, url_prefix='/admin')
app.register_blueprint(specialist_bp, url_prefix='/specialist')
app.register_blueprint(feedback_bp, url_prefix='/feedback')
app.register_blueprint(history_bp, url_prefix='/history')
# app.register_blueprint(notification_bp, url_prefix='/notifications')

# Start the retraining pipeline in a separate thread
def start_pipeline():
    start_retraining_pipeline()

if __name__ == '__main__':
    # Start the pipeline in a separate thread to avoid blocking the Flask app
    Thread(target=start_pipeline, daemon=True).start()

    # Start the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)
