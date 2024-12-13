from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required
from werkzeug.security import generate_password_hash, check_password_hash
from services.rbac import role_required
from datetime import datetime
from database.db import get_db
from bson import ObjectId

auth_bp = Blueprint('auth', __name__)

# MongoDB Connection
db = get_db()
users_collection = db['users']

# Registration Endpoint
@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    role = data.get('role')

    if not all([username, email, password, role]):
        return jsonify({"error": "All fields are required"}), 400

    # Check if email already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "Email already registered"}), 400

    # Default status based on role
    status = "Pending" if role in ["admin", "specialist", "seller"] else "Approved"

    # Hash the password
    hashed_password = generate_password_hash(password)

    # User object
    user = {
        "username": username,
        "email": email,
        "password": hashed_password,
        "role": role,
        "status": status,
        "createdAt": datetime.utcnow()
    }

    # Add labelled_count for specialists
    if role == "specialist":
        user["labelled_count"] = 0

    # Insert user into DB
    users_collection.insert_one(user)

    # Return appropriate message
    message = "Registration successful. Awaiting admin approval." if status == "Pending" else "Registration successful."
    return jsonify({"message": message}), 201


@auth_bp.route('/pending-users', methods=['GET'])
@jwt_required()
@role_required('admin')
def get_pending_users():
    # Find pending users and exclude the "password" field
    pending_users = list(users_collection.find({"status": "Pending"}, {"password": 0}))
    
    # Convert ObjectId to string in each document
    for user in pending_users:
        user["_id"] = str(user["_id"])
    
    return jsonify({"pending_users": pending_users}), 200



# from bson import ObjectId  # Ensure ObjectId is imported

@auth_bp.route('/approve-user', methods=['POST'])
@jwt_required()
@role_required('admin')
def approve_user():
    data = request.json
    user_id = data.get('user_id')
    action = data.get('action')  # 'approve' or 'reject'

    # Validate action
    if action not in ["approve", "reject"]:
        return jsonify({"error": "Invalid action. Use 'approve' or 'reject'."}), 400

    try:
        # Convert user_id to ObjectId
        user_object_id = ObjectId(user_id)
    except Exception:
        return jsonify({"error": "Invalid user ID format"}), 400

    # Find user by _id
    user = users_collection.find_one({"_id": user_object_id})
    if not user:
        return jsonify({"error": "User not found"}), 404

    if action == "approve":
        # Update user status to Approved
        users_collection.update_one({"_id": user_object_id}, {"$set": {"status": "Approved"}})
        return jsonify({"message": "User approved successfully."}), 200
    elif action == "reject":
        # Remove the user from the database
        users_collection.delete_one({"_id": user_object_id})
        return jsonify({"message": "User rejected and removed from the database."}), 200



# Login Endpoint
@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    if not all([email, password]):
        return jsonify({"error": "Email and password are required"}), 400
    
    print("before accessing mongo: ", email, password)

    # Find user by email
    user = users_collection.find_one({"email": email})
    
    print("user: ", user)
    
    if not user or not check_password_hash(user['password'], password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Check if user is approved
    if user['status'] != "Approved":
        return jsonify({"error": "Account pending admin approval."}), 403

    # Generate JWT token
    access_token = create_access_token(identity={
        "username": user['username'],
        "email": user['email'],
        "role": user['role']
    })

    return jsonify({"access_token": access_token, "role": user['role']}), 200

