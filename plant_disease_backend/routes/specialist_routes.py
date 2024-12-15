from flask import Blueprint, jsonify, request, send_from_directory, send_file
import os
from flask_jwt_extended import get_jwt_identity, jwt_required
from database.db import get_db
from services.rbac import role_required, basic_auth_required

specialist_bp = Blueprint('specialist', __name__)

# MongoDB Connection
db = get_db()
users_collection = db['users']

# Path configurations
UNKNOWN_IMAGES_PATH = "unknown_images"
LABELLED_IMAGES_PATH = "labelled_images"



@specialist_bp.route('/unknown_images', methods=['GET'])
@basic_auth_required
@role_required('specialist')
def get_unknown_images():
    """Fetch all unknown images for the specialist."""
    try:
        images = os.listdir(UNKNOWN_IMAGES_PATH)
        image_urls = [f"/specialist/preview/{img}" for img in images]
        return jsonify({"images": image_urls}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500



@specialist_bp.route('/preview/<image_name>', methods=['GET'])
def preview_image(image_name):
    """Preview a specific unknown image."""
    try:
        # return send_from_directory(UNKNOWN_IMAGES_PATH, image_name)
        file_path = os.path.join(UNKNOWN_IMAGES_PATH, image_name)
        # improved_path = os.path.abspath(file_path)
        # print("File path: ", file_path)
        # print("Improved path: ", improved_path)
        return send_file("../"+file_path)
    except FileNotFoundError:
        return jsonify({"error": "Image not found"}), 404



@specialist_bp.route('/label_images', methods=['POST'])
@basic_auth_required
@role_required('specialist')
def label_images():
    """Label images with the selected disease."""
    data = request.json
    images = data.get('images')  # List of image filenames
    disease = data.get('disease')  # Disease label

    if not all([images, disease]):
        return jsonify({"error": "Images and disease are required"}), 400

    try:
        # Create folder for the disease if it doesn't exist
        disease_folder = os.path.join(LABELLED_IMAGES_PATH, disease)
        os.makedirs(disease_folder, exist_ok=True)

        # Move each image to the disease folder
        for image in images:
            source_path = os.path.join(UNKNOWN_IMAGES_PATH, image)
            dest_path = os.path.join(disease_folder, image)
            if os.path.exists(source_path):
                os.rename(source_path, dest_path)
        
        # print(f"{len(images)} images labeled as '{disease}'.")

        # Update specialist's labeled count
        current_user = request.user
        # print("Current user email: ", current_user['email'])
        users_collection.update_one(
            {"email": current_user['email']},
            {"$inc": {"labelled_count": len(images)}}
        )

        return jsonify({"message": f"{len(images)} images labeled as '{disease}'."}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500
