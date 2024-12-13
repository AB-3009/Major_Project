from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required
from database.db import get_db
from services.rbac import role_required, basic_auth_required

history_bp = Blueprint('history', __name__)

# MongoDB Connection
db = get_db()
predictions_collection = db['predictions']  # Ensure you have a collection for predictions

# Get Prediction History
@history_bp.route('/history', methods=['GET'])
@basic_auth_required
@role_required('customer')
def get_history():
    customer_email = request.user['email']  # Get the email from JWT identity
    history = predictions_collection.find({"email": customer_email})

    history_data = []
    for record in history:
        history_data.append({
            "image_path": record['image_path'],
            "predicted_disease": record['predicted_disease'],
            "confidence": record['confidence'],
            "description": record["description"],
            "remedies": record["remedies"],
            "next_steps": record["next_steps"],
            "createdAt": record['createdAt']
        })

    return jsonify(history_data), 200 