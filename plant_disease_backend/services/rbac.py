from database.db import get_db
from flask_jwt_extended import get_jwt_identity
from functools import wraps
from flask import jsonify, request


db = get_db()
users_collection = db['users']

# Role-based Access Control (RBAC) Decorator
def role_required(required_role):
    def wrapper(func):
        @wraps(func)
        def decorator(*args, **kwargs):
            current_user = get_jwt_identity()
            request.user = current_user  # Store user info in request for easy access
            if current_user['role'] != required_role:
                return jsonify({"error": "Access denied"}), 403

            # Check if user is approved
            user = users_collection.find_one({"email": current_user['email']})
            if user['status'] != "Approved":
                return jsonify({"error": "Account pending admin approval."}), 403

            return func(*args, **kwargs)
        return decorator
    return wrapper