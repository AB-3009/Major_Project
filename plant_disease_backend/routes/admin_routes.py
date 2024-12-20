from datetime import datetime
from flask import Blueprint, jsonify, send_from_directory, send_file
from flask_jwt_extended import jwt_required
from services.email_service import send_email
from services.rbac import role_required, basic_auth_required
from database.db import get_db
from bson import ObjectId
import os

admin_bp = Blueprint('admin', __name__)

# MongoDB Connection
db = get_db()
users_collection = db['users']
products_collection = db['products']
tasks_collection = db['tasks']
feedback_collection = db['feedback']

PRODUCT_IMAGES_PATH = "product_images"

# Admin view of all sellers and their products
@admin_bp.route('/sellers', methods=['GET'])
@basic_auth_required
@role_required('admin')
def list_sellers():
    sellers = users_collection.find({"role": "seller"})
    seller_list = []
        
    for seller in sellers:   
        if seller['status'] == 'Approved':          
            products = products_collection.find({"seller_id": seller['email']})
            product_list = []
            for product in products:
                product_list.append({
                    "product_id": str(product['_id']),
                    "name": product['name'],
                    "description": product['description'],
                    "price": product['price'],
                    "quantity": product['quantity'],
                    "image": product['image']
                })
            
            seller_list.append({
                "username": seller['username'],
                "email": seller['email'],
                "products": product_list
            })
    
    if not seller_list:
        return jsonify({"message": "No Approved sellers found."}), 404
    
    return jsonify(seller_list), 200


@admin_bp.route('/preview/<image_name>', methods=['GET'])
def preview_image(image_name):
    """Preview a specific unknown image."""
    try:
        # return send_from_directory(PRODUCT_IMAGES_PATH, image_name)
        file_path = os.path.join(PRODUCT_IMAGES_PATH, image_name)
        
        return send_file("../"+file_path)
    except FileNotFoundError:
        return jsonify({"error": "Image not found"}), 404

# Admin deletes a product
@admin_bp.route('/delete_product/<product_id>', methods=['DELETE'])
@basic_auth_required
@role_required('admin')
def delete_product(product_id):
    # Find product
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        return jsonify({"error": "Product not found"}), 404
    
    # Find seller who owns the product
    seller = users_collection.find_one({"email": product['seller_id'], "role": "seller"})
    if not seller:
        return jsonify({"error": "Seller not found"}), 404

    # Delete product
    products_collection.delete_one({"_id": ObjectId(product_id)})

    # Send email to seller about product deletion
    send_email(
        seller['email'],
        "Product Deleted",
        f"Dear {seller['username']},\nYour product '{product['name']}' was deleted by the admin. Reason: <Reason for deletion>."
    )

    return jsonify({"message": f"Product '{product['name']}' deleted successfully. An email has been sent to the seller."}), 200


# Admin deletes a seller and all their products
@admin_bp.route('/delete_seller/<seller_email>', methods=['DELETE'])
@basic_auth_required
@role_required('admin')
def delete_seller(seller_email):
    # Find seller by email
    seller = users_collection.find_one({"email": seller_email, "role": "seller"})
    if not seller:
        return jsonify({"error": "Seller not found"}), 404
    
    # Find and delete all products associated with the seller (using seller's email as seller_id)
    products_collection.delete_many({"seller_id": seller_email})

    # Delete seller account
    users_collection.delete_one({"email": seller_email})

    # Send email to seller about account deletion
    send_email(
        seller_email,
        "Account Deleted",
        f"Dear {seller['username']},\nYour account has been deleted by the admin. Reason: <Reason for deletion>."
    )

    return jsonify({"message": f"Seller '{seller['username']}' and their products have been deleted. An email has been sent to the seller."}), 200


# Admin views the list of specialists
@admin_bp.route('/specialists', methods=['GET'])
@basic_auth_required
@role_required('admin')
def get_specialists():
    # Get all specialists from the users collection
    specialists = users_collection.find({"role": "specialist"})
    
    # Prepare a list of specialists to send in the response
    specialists_list = []
    for specialist in specialists:
        specialists_list.append({
            "username": specialist['username'],
            "email": specialist['email'],
            "status": specialist['status'],
            "createdAt": specialist['createdAt']
        })
    
    return jsonify(specialists_list), 200


# Admin assigns a specialist to the task of labeling unknown images
@admin_bp.route('/assign_labeling_task/<specialist_email>', methods=['POST'])
@basic_auth_required
@role_required('admin')
def assign_labeling_task(specialist_email):
    # Find the specialist by email
    specialist = users_collection.find_one({"email": specialist_email, "role": "specialist"})
    if not specialist:
        return jsonify({"error": "Specialist not found"}), 404
    
    # Check if the specialist's status is "approved"
    if specialist['status'] != 'Approved':
        return jsonify({"error": "Specialist's account is not approved. Task cannot be assigned."}), 400
    
    # # Assign the task (e.g., labeling unknown images)
    # task = {
    #     "specialist_email": specialist_email,
    #     "task_type": "Labeling Unknown Images",
    #     "status": "Assigned",
    #     "assigned_at": datetime.utcnow()
    # }

    # # Example: Store the task in a tasks collection (this is hypothetical, and should be adjusted for your DB structure)
    # tasks_collection.insert_one(task)

    # Send an email notification to the specialist about the assigned task
    send_email(
        specialist_email,
        "New Task Assigned",
        f"Dear {specialist['username']},\nYou have been assigned the task of labeling unknown images."
    )

    return jsonify({"message": f"Task has been assigned to {specialist['username']}."}), 200


# Admin view of all feedback
@admin_bp.route('/feedback', methods=['GET'])
@basic_auth_required
@role_required('admin')
def view_feedback():
    feedback_list = feedback_collection.find()
    feedback_data = []

    for feedback in feedback_list:
        feedback_data.append({
            "email": feedback['email'],
            "feedback": feedback['feedback'],
            "createdAt": feedback['createdAt']
        })

    return jsonify(feedback_data), 200
