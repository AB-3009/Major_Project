from database.db import get_db
from functools import wraps
from flask import jsonify, request

# MongoDB Connection
db = get_db()
users_collection = db['users']

# Session Token Authentication Decorator
def basic_auth_required(func):
    @wraps(func)
    def decorator(*args, **kwargs):
        # Extract the Authorization header
        auth_header = request.headers.get('Authorization')

        if not auth_header:
            return jsonify({"error": "Authorization header is missing"}), 401

        # Extract session token
        try:
            auth_type, session_token = auth_header.split(' ')
            if auth_type.lower() != 'bearer':
                return jsonify({"error": "Invalid authorization type. Use 'Bearer'."}), 401
        except ValueError:
            return jsonify({"error": "Invalid authorization header format"}), 401

        # Check if the session token exists in the database
        user = users_collection.find_one({"session_token": session_token})
        if not user:
            return jsonify({"error": "Invalid or expired session token"}), 401

        # Store user info in request for easy access
        request.user = user
        return func(*args, **kwargs)
    return decorator


# Role-based Access Control (RBAC) Decorator
def role_required(required_role):
    def wrapper(func):
        @wraps(func)
        def decorator(*args, **kwargs):
            # Use the user information stored by session_auth_required
            current_user = getattr(request, 'user', None)
            if not current_user:
                return jsonify({"error": "Unauthorized access. Please authenticate."}), 401

            # Check if the user's role matches the required role
            if current_user['role'] != required_role:
                return jsonify({"error": f"Access denied for role: {required_role}"}), 403

            return func(*args, **kwargs)
        return decorator
    return wrapper
