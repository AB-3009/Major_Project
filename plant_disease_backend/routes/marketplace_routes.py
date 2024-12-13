import os
from bson import ObjectId
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from flask_jwt_extended import jwt_required
from services.rbac import role_required, basic_auth_required
from database.db import get_db
from services.email_service import send_email

marketplace_bp = Blueprint('marketplace', __name__)

# MongoDB Connection
db = get_db()
products_collection = db['products']

# File Upload Configuration
UPLOAD_FOLDER = './product_images'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Add Product (Seller)
@marketplace_bp.route('/add', methods=['POST'])
@basic_auth_required
@role_required('seller')
def add_product():
    data = request.form.to_dict()
    name = data.get('name')
    description = data.get('description')
    price = data.get('price')
    quantity = data.get('quantity')
    
    if not all([name, description, price, quantity]):
        return jsonify({"error": "All fields are required"}), 400

    # Handle file upload
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    # Save product to DB
    product = {
        "name": name,
        "description": description,
        "price": price,
        "quantity": quantity,
        "image": filepath,
        "seller_id": request.user['email'],  # Assuming email is part of JWT identity
    }

    products_collection.insert_one(product)

    return jsonify({"message": "Product added successfully."}), 201

# Update Product (Seller)
@marketplace_bp.route('/update/<product_id>', methods=['PUT'])
@basic_auth_required
@role_required('seller')
def update_product(product_id):
    data = request.form.to_dict()
    updated_data = {}

    if 'name' in data:
        updated_data['name'] = data['name']
    if 'description' in data:
        updated_data['description'] = data['description']
    if 'price' in data:
        updated_data['price'] = data['price']
    if 'quantity' in data:
        updated_data['quantity'] = data['quantity']

    # Handle image update if provided
    if 'image' in request.files:
        file = request.files['image']
        filename = secure_filename(file.filename)
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        updated_data['image'] = filepath

    # Update the product in DB
    result = products_collection.update_one(
        {"_id": ObjectId(product_id), "seller_id": request.user['email']},
        {"$set": updated_data}
    )
    
    if result.modified_count == 0:
        return jsonify({"error": "Product not found or unauthorized"}), 404

    return jsonify({"message": "Product updated successfully."}), 200

# Delete Product (Seller)
@marketplace_bp.route('/delete/<product_id>', methods=['DELETE'])
@basic_auth_required
@role_required('seller')
def delete_product(product_id):
    result = products_collection.delete_one(
        {"_id": ObjectId(product_id), "seller_id": request.user['email']}
    )

    if result.deleted_count == 0:
        return jsonify({"error": "Product not found or unauthorized"}), 404

    return jsonify({"message": "Product deleted successfully."}), 200

# Get Seller's Products
@marketplace_bp.route('/my-products', methods=['GET'])
@basic_auth_required
@role_required('seller')
def get_seller_products():
    seller_email = request.user['email']
    products = list(products_collection.find({"seller_id": seller_email}))
    
    # Convert ObjectId to string for JSON response
    for product in products:
        product["_id"] = str(product["_id"])

    return jsonify({"products": products}), 200

# Get All Products (Customer)
@marketplace_bp.route('/all', methods=['GET'])
@basic_auth_required
@role_required('customer')
def get_all_products():
    products = list(products_collection.find())
    
    # Convert ObjectId to string for JSON response
    for product in products:
        product["_id"] = str(product["_id"])

    return jsonify({"products": products}), 200

# Get Product Details (Customer)
@marketplace_bp.route('/product/<product_id>', methods=['GET'])
@basic_auth_required
@role_required('customer')
def get_product_details(product_id):
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Convert ObjectId to string for JSON response
    product["_id"] = str(product["_id"])

    return jsonify({"product": product}), 200

# Place Order (Customer)
@marketplace_bp.route('/purchase/<product_id>', methods=['POST'])
@basic_auth_required
@role_required('customer')
def purchase_product(product_id):
    # Get the product details
    product = products_collection.find_one({"_id": ObjectId(product_id)})
    if not product:
        return jsonify({"error": "Product not found"}), 404

    # Get customer details (from JWT)
    customer_email = request.user['email']
    
    # Get the quantity from the request body
    data = request.json
    quantity = data.get('quantity', 1)  # Default to 1 if no quantity is provided

    # Check if quantity is valid (e.g., must be a positive integer)
    if quantity <= 0:
        return jsonify({"error": "Quantity must be a positive number"}), 400

    # Ensure there is enough stock by converting product['quantity'] to an integer
    try:
        product_quantity = int(product['quantity'])
    except ValueError:
        return jsonify({"error": "Invalid quantity in product data"}), 400

    if product_quantity < quantity:
        return jsonify({"error": "Not enough stock available"}), 400

    # Update the quantity and save as a string
    updated_quantity = str(product_quantity - quantity)  # Convert the updated quantity back to a string

    # Update the product in the database with the new quantity (as a string)
    products_collection.update_one(
        {"_id": ObjectId(product_id)},
        {"$set": {"quantity": updated_quantity}}  # Save quantity as a string
    )

    # Send email to seller
    send_email(
        product['seller_id'],
        "New Order",
        f"Customer {customer_email} has ordered {product['name']} (Quantity: {quantity})."
    )

    return jsonify({"message": f"Order placed successfully. An email has been sent to the seller for {quantity} item(s)."}), 200