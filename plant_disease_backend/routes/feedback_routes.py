from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database.db import get_db
from services.email_service import send_email  # Import the send_email function
from datetime import datetime
from services.rbac import role_required, basic_auth_required

feedback_bp = Blueprint('feedback', __name__)

# MongoDB Connection
db = get_db()
feedback_collection = db['feedback']
users_collection = db['users']  # Access users collection to get admin emails

# Submit Feedback
@feedback_bp.route('/submit_feedback', methods=['POST'])
@basic_auth_required
@role_required('customer')
def submit_feedback():
    data = request.json
    customer_email = request.user['email']  # Get the email from JWT identity
    feedback_text = data.get('feedback')

    if not feedback_text:
        return jsonify({"error": "Feedback is required"}), 400

    feedback = {
        "email": customer_email,
        "feedback": feedback_text,
        "createdAt": datetime.utcnow()
    }

    feedback_collection.insert_one(feedback)

    # Notify all admins via email
    admins = users_collection.find({"role": "admin"})
    for admin in admins:
        send_email(
            admin['email'],
            "New Feedback Submitted",
            f"New feedback from {customer_email}: {feedback_text}"
        )

    return jsonify({"message": "Feedback submitted successfully."}), 201 