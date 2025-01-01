from flask import Blueprint, jsonify, request, send_from_directory, send_file
import os
from flask_jwt_extended import get_jwt_identity, jwt_required
from database.db import get_db
from services.rbac import role_required, basic_auth_required
import base64
import json
from groq import Groq
from werkzeug.utils import secure_filename
from IPython.display import Image
import pandas as pd

specialist_bp = Blueprint('specialist', __name__)

# MongoDB Connection
db = get_db()
users_collection = db['users']

# Path configurations
UNKNOWN_IMAGES_PATH = "unknown_images"
LABELLED_IMAGES_PATH = "labelled_images"

# Initialize Groq client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))
model = 'llama-3.2-11b-vision-preview'

# Define class labels
class_labels = ["Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy","Blueberry___healthy","Cherry_(including_sour)___healthy","Cherry_(including_sour)___Powdery_mildew","Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn_(maize)___Common_rust","Corn_(maize)___healthy","Corn_(maize)___Northern_Leaf_Blight","Grape___Black_rot","Grape___Esca_(Black_Measles)","Grape___healthy","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy","Pepper_bell___Bacterial_spot","Pepper_bell___healthy","Potato___Early_blight","Potato___healthy","Potato___Late_blight","Raspberry___healthy","Soybean___healthy","Squash___Powdery_mildew","Strawberry___healthy","Strawberry___Leaf_scorch","Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___healthy","Tomato___Late_blight","Tomato___Leaf_Mold","Tomato___Septoria_leaf_spot","Tomato___Spider_mites Two-spotted_spider_mite","Tomato___Target_Spot","Tomato___Tomato_mosaic_virus","Tomato___Tomato_Yellow_Leaf_Curl_Virus"]

# Function to encode image to base64
def encode_image(image_path):
    with open(image_path, "rb") as image_file:
        return base64.b64encode(image_file.read()).decode('utf-8')

# Function to classify image using Groq API
def image_classification(base64_image, user_prompt):
    chat_completion = client.chat.completions.create(
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "image_url",
                        "image_url": {
                            "url": f"data:image/jpeg;base64,{base64_image}",
                        },
                    },
                    {"type": "text", "text": user_prompt},
                ],
            }
        ],
        model=model,
        response_format={"type": "json_object"}
    )
    response = json.loads(chat_completion.choices[0].message.content)
    
    # Validate disease name
    if response['disease_name'] not in class_labels:
        response['disease_name'] = 'Unknown'
    
    return response



# Route to classify plant disease images
# @basic_auth_required
# @role_required('specialist')
@specialist_bp.route('/classify_disease', methods=['POST'])
def classify_disease():
    print("before file image check")
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    print("before file")
    file = request.files['image']
    print("File: ", file)
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join('uploads', filename)
    file.save(filepath)

    base64_image = encode_image(filepath)

    user_prompt = '''
    Your job is to extract structured data from an image of a plant and identify any diseases present. 
    The JSON schema should strictly be the following:
    {
        "disease_name": "string (e.g., "Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy","Blueberry___healthy","Cherry_(including_sour)___healthy","Cherry_(including_sour)___Powdery_mildew","Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn_(maize)___Common_rust","Corn_(maize)___healthy","Corn_(maize)___Northern_Leaf_Blight","Grape___Black_rot","Grape___Esca_(Black_Measles)","Grape___healthy","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy","Pepper_bell___Bacterial_spot","Pepper_bell___healthy","Potato___Early_blight","Potato___healthy","Potato___Late_blight","Raspberry___healthy","Soybean___healthy","Squash___Powdery_mildew","Strawberry___healthy","Strawberry___Leaf_scorch","Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___healthy","Tomato___Late_blight","Tomato___Leaf_Mold","Tomato___Septoria_leaf_spot","Tomato___Spider_mites Two-spotted_spider_mite","Tomato___Target_Spot","Tomato___Tomato_mosaic_virus","Tomato___Tomato_Yellow_Leaf_Curl_Virus")",
        "severity": "string (categorical: 'Low', 'Medium', 'High')",
        "affected_parts": "string (e.g., 'Leaves', 'Stems', 'Roots')",
        "number_of_infected_parts": "integer (number of infected parts in the image)",
        "is_urgent": "boolean (TRUE if immediate action is needed, FALSE otherwise)",
        "image_file": "string (name of the image file)"
    }

    Use the information from the following plant disease photo to construct the proper JSON output.
    '''

    try:
        image_json = image_classification(base64_image, user_prompt)
        image_json['image_file'] = filename
        return jsonify(image_json), 200
    except Exception as e:
        return jsonify({"error": f"Classification failed: {str(e)}"}), 500

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
