import os
import shutil
from flask_jwt_extended import jwt_required
import numpy as np
from flask import Blueprint, request, jsonify, send_file
from werkzeug.utils import secure_filename
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from datetime import datetime
from tensorflow.keras.models import load_model
import tensorflow as tf
import re
from services.rbac import role_required, basic_auth_required
import requests
from database.db import get_db
import base64
import subprocess
import sys
# subprocess.check_call([sys.executable, "-m", "pip", "install", "opencv-python"])
# print("OpenCV installed successfully!")

import cv2
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()


predict_bp = Blueprint('predict', __name__)

# Upload folder
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Folder to store unknown images
UNKNOWN_FOLDER = './unknown_images'
os.makedirs(UNKNOWN_FOLDER, exist_ok=True)

# print(tf.__version__)
# print(tf.keras.__version__)
# MongoDB Connection
db = get_db()
predictions_collection = db['predictions']


# Load the trained CNN model
model_path = "models/plant_disease_model.h5"
model = load_model(model_path)

print("Model loaded successfully.")
# print("Model summary: ", model.summary())
# print("Model input shape: ", model.input_shape)

# Image size (ensure this matches the input size of your model)
IMG_SIZE = (256, 256)  # Example size, adjust based on your model.

# Confidence threshold for unknown predictions
CONFIDENCE_THRESHOLD = 0.8

# Hugging Face API details
HF_API_URL = "https://api-inference.huggingface.co/models/gpt2"
HF_HEADERS = {"Authorization": f"Bearer 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"}  # Replace with your token




client = Groq(
    api_key=os.environ.get("GROQ_API_KEY"),
)




def fetch_disease_details(disease_name):
    prompt = f"""
    Provide information about the plant disease: {disease_name}. 
    Return the response in the following JSON format:
    {{
        "description": "Brief description of the disease.",
        "remedies": ["List of remedies or treatments."],
        "next_steps": ["List of next steps to manage the disease."]
    }}
    """

    try:
        # Groq API call
        chat_completion = client.chat.completions.create(
            messages=[
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
            model="llama3-8b-8192",
        )
        
        # Extract response
        response_text = chat_completion.choices[0].message.content

        # Log raw response for debugging
        print("Raw response from Groq:", response_text)

        # Extract JSON block using regex
        json_match = re.search(r'\{[\s\S]*\}', response_text)
        
        if json_match:
            json_text = json_match.group(0)
        else:
            print("No JSON block found. Falling back to manual parsing.")
            return parse_generated_text(response_text)

        # Parse the extracted JSON
        try:
            response_json = json.loads(json_text)
        except json.JSONDecodeError:
            print("Failed to decode JSON. Falling back to manual parsing.")
            return parse_generated_text(response_text)

        # Ensure necessary fields exist
        return {
            "description": response_json.get("description", "No description available."),
            "remedies": response_json.get("remedies", ["No remedies provided."]),
            "next_steps": response_json.get("next_steps", ["No next steps provided."])
        }

    except Exception as e:
        print(f"Error fetching AI-generated details: {e}")
        return {
            "description": f"Error fetching AI-generated details: {str(e)}",
            "remedies": ["Check your internet connection."],
            "next_steps": ["Retry the request."]
        }


def parse_generated_text(text):
    """
    Parse the AI-generated text into structured information.
    """
    parts = text.split("\n")
    description = parts[0] if len(parts) > 0 else "No description available."
    remedies = [line for line in parts if line.startswith("-")]
    next_steps = [line for line in parts if line.startswith("*")]
    return {
        "description": description,
        "remedies": remedies or ["No remedies provided."],
        "next_steps": next_steps or ["No next steps provided."]
    }

    
@predict_bp.route('/predict', methods=['POST'])
@basic_auth_required
@role_required('customer')
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
    
    

    filename = secure_filename(file.filename)
    # print("Filename: ", filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    # print("Filepath: ", filepath)
    file.save(filepath)

    try:
        # Preprocess the image
        img = load_img(filepath, target_size=IMG_SIZE)
        img_array = img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Predict
        predictions = model.predict(img_array)
        confidence = np.max(predictions)
        predicted_label = np.argmax(predictions)

        # Handle unknown predictions
        # Save unknown image
        if confidence < CONFIDENCE_THRESHOLD:
            unknown_filename = re.sub(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+_', '', filename)
            unknown_filepath = os.path.join(UNKNOWN_FOLDER, unknown_filename)
            # print("Unknown filepath: ", unknown_filepath)
            shutil.copy(filepath, unknown_filepath)
            # file.save(unknown_filepath)

            return jsonify({
                "label": "unknown",
                "confidence": float(confidence),
                "message": "Confidence too low, image saved for specialist labeling."
            }), 200

        # Label mapping (example)
        labels = ["Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy","Blueberry___healthy","Cherry_(including_sour)___healthy","Cherry_(including_sour)___Powdery_mildew","Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn_(maize)___Common_rust","Corn_(maize)___healthy","Corn_(maize)___Northern_Leaf_Blight","Grape___Black_rot","Grape___Esca_(Black_Measles)","Grape___healthy","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy","Pepper_bell___Bacterial_spot","Pepper_bell___healthy","Potato___Early_blight","Potato___healthy","Potato___Late_blight","Raspberry___healthy","Soybean___healthy","Squash___Powdery_mildew","Strawberry___healthy","Strawberry___Leaf_scorch","Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___healthy","Tomato___Late_blight","Tomato___Leaf_Mold","Tomato___Septoria_leaf_spot","Tomato___Spider_mites Two-spotted_spider_mite","Tomato___Target_Spot","Tomato___Tomato_mosaic_virus","Tomato___Tomato_Yellow_Leaf_Curl_Virus"]
        disease_name = labels[predicted_label]

         # Fetch additional disease information using Hugging Face API
        disease_info = fetch_disease_details(disease_name)

        customer_email = request.user['email']  # Get the email from JWT identity
        prediction_record = {
                "email": customer_email,
                "image_path": filepath,
                "predicted_disease": disease_name,
                "confidence": float(confidence),
                "description": disease_info["description"],
                "remedies": disease_info["remedies"],
                "next_steps": disease_info["next_steps"],
                "createdAt": datetime.utcnow()
            }
        predictions_collection.insert_one(prediction_record)
    
        return jsonify({
            "label": disease_name,
            "confidence": float(confidence),
            "description": disease_info["description"],
            "remedies": disease_info["remedies"],
            "next_steps": disease_info["next_steps"],
            "message": "Prediction successful with additional details."
        }), 200
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
    # finally:
        # Clean up the uploaded file
        # os.remove(filepath)

@predict_bp.route('/preview/<image_name>', methods=['GET'])
def preview_image(image_name):
    """Preview a specific unknown image."""
    try:
        # return send_from_directory(UNKNOWN_IMAGES_PATH, image_name)
        file_path = os.path.join(UPLOAD_FOLDER, image_name)
        # improved_path = os.path.abspath(file_path)
        # print("File path: ", file_path)
        # print("Improved path: ", improved_path)
        return send_file("../"+file_path)
    except FileNotFoundError:
        return jsonify({"error": "Image not found"}), 404




# Load the TensorFlow Lite model
tflite_model_path = 'models/plant_disease_model_final.tflite'
interpreter = tf.lite.Interpreter(model_path=tflite_model_path)
interpreter.allocate_tensors()

# Get model input and output details
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

# Threshold for confidence level
CONFIDENCE_THRESHOLD = 0.8

# Dynamically load class labels from the subdirectories in the data folder
# data_dir = 'C:/files/plant-disease-detection/data'
# class_labels = {i: folder_name for i, folder_name in enumerate(sorted(os.listdir(data_dir))) if os.path.isdir(os.path.join(data_dir, folder_name))}

class_labels = ["Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy","Blueberry___healthy","Cherry_(including_sour)___healthy","Cherry_(including_sour)___Powdery_mildew","Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn_(maize)___Common_rust","Corn_(maize)___healthy","Corn_(maize)___Northern_Leaf_Blight","Grape___Black_rot","Grape___Esca_(Black_Measles)","Grape___healthy","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy","Pepper_bell___Bacterial_spot","Pepper_bell___healthy","Potato___Early_blight","Potato___healthy","Potato___Late_blight","Raspberry___healthy","Soybean___healthy","Squash___Powdery_mildew","Strawberry___healthy","Strawberry___Leaf_scorch","Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___healthy","Tomato___Late_blight","Tomato___Leaf_Mold","Tomato___Septoria_leaf_spot","Tomato___Spider_mites Two-spotted_spider_mite","Tomato___Target_Spot","Tomato___Tomato_mosaic_virus","Tomato___Tomato_Yellow_Leaf_Curl_Virus"]

def preprocess_image(img):
    # Resize and normalize image to match training preprocessing
    if img is None or img.size == 0:
        raise ValueError("Empty or invalid image passed to preprocess_image.")
    img = cv2.resize(img, (128, 128))
    img = img / 255.0
    img = img_to_array(img)
    img = np.expand_dims(img, axis=0)
    return img

def process_frame(frame):
    try:
        # Preprocess the image
        image = preprocess_image(frame)

        # Set input tensor
        interpreter.set_tensor(input_details[0]['index'], image)

        # Run inference
        interpreter.invoke()

        # Get output tensor
        prediction = interpreter.get_tensor(output_details[0]['index'])
        predicted_class_index = np.argmax(prediction, axis=-1)[0]
        confidence = np.max(prediction, axis=-1)[0]

        # Determine class label using list indexing
        if 0 <= predicted_class_index < len(class_labels):
            predicted_class = class_labels[predicted_class_index]
        else:
            predicted_class = 'unknown'

        return predicted_class, confidence

    except Exception as e:
        print(f"Error processing frame: {e}")
        return 'unknown', 0.0


@predict_bp.route('/process_frame', methods=['POST'])
def process_frame_endpoint():
    try:
        print("Processing frame...")
        data = request.json
        if 'frame' not in data:
            return jsonify({'error': 'No frame provided'}), 400

        # Extract and decode base64 data
        print("Decoding frame...")
        base64_data = data['frame'].split(",")[1]
        print("Base64 data:", base64_data)
        frame = np.frombuffer(base64.b64decode(base64_data), np.uint8)
        print("Frame decoded successfully.", frame)
        frame = cv2.imdecode(frame, cv2.IMREAD_COLOR)
        print("Frame:", frame)
        predicted_class, confidence = process_frame(frame)
        print("Predicted class:", predicted_class)
        print("Confidence:", confidence)

        return jsonify({'class': predicted_class, 'confidence': float(confidence)}), 200
    except Exception as e:
        print(f"Error in process_frame_endpoint: {e}")
        return jsonify({'error': str(e)}), 500

'''
import os
import shutil
import requests
import numpy as np
from flask_jwt_extended import jwt_required
from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from tensorflow.keras.preprocessing.image import load_img, img_to_array
from tensorflow.keras.models import load_model
import re
from services.rbac import role_required
from transformers import pipeline  # For using pre-trained language models

predict_bp = Blueprint('predict', __name__)

# Upload folder
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Folder to store unknown images
UNKNOWN_FOLDER = './unknown_images'
os.makedirs(UNKNOWN_FOLDER, exist_ok=True)

# Load the trained CNN model
model_path = "C:/files/major project/plant_disease_backend/models/plant_disease_model.h5"
model = load_model(model_path)

# Image size (ensure this matches the input size of your model)
IMG_SIZE = (256, 256)  # Example size, adjust based on your model.

# Confidence threshold for unknown predictions
CONFIDENCE_THRESHOLD = 0.8

API_KEY = "AIzaSyDpD7R2L6Z1MiboiymbH4z0llDLTuoncJc"
# Replace GPT-3 model with Gemini API for AI insights
def get_ai_insights(disease_name):
    api_url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyDpD7R2L6Z1MiboiymbH4z0llDLTuoncJc"  # Replace with the actual Gemini API URL

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
    }
    data = {
        "input_text": f"Explain the causes, remedies, and next steps for {disease_name} disease in plants.",
        "model": "gemini-v1",
        "task": "text-generation"
    }
    
    try:
        response = requests.post(api_url, headers=headers, json=data)
        print("response: ",response.json())
        if response.status_code == 200:
            return response.json()['output_text']
        else:
            raise Exception(f"Error fetching AI insights: {response.status_code}")
    except Exception as e:
        return str(e)

# Function to query external product sources (e.g., Amazon or custom API)
def get_external_products(disease_name):
    try:
        # For example, using a mock API or external service (You can integrate actual APIs like Amazon)
        api_url = f"https://api.example.com/products?search={disease_name}&category=plant-care"
        response = requests.get(api_url)
        products = response.json().get('products', [])
        return [
            {
                "product_name": product['name'],
                "price": product['price'],
                "link": product['link']
            } for product in products
        ]
    except Exception as e:
        print(f"Error fetching external products: {e}")
        return []

@predict_bp.route('/predict', methods=['POST'])
@jwt_required()
@role_required('customer')
def predict():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    filename = secure_filename(file.filename)
    filepath = os.path.join(UPLOAD_FOLDER, filename)
    file.save(filepath)

    try:
        # Preprocess the image
        img = load_img(filepath, target_size=IMG_SIZE)
        img_array = img_to_array(img) / 255.0
        img_array = np.expand_dims(img_array, axis=0)

        # Predict
        predictions = model.predict(img_array)
        confidence = np.max(predictions)
        predicted_label = np.argmax(predictions)

        # Handle unknown predictions
        if confidence < CONFIDENCE_THRESHOLD:
            unknown_filename = re.sub(r'^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d+_', '', filename)
            unknown_filepath = os.path.join(UNKNOWN_FOLDER, unknown_filename)
            shutil.copy(filepath, unknown_filepath)

            return jsonify({
                "label": "unknown",
                "confidence": float(confidence),
                "message": "Confidence too low, image saved for specialist labeling."
            }), 200

        # Label mapping (example)
        labels = ["Apple___Apple_scab","Apple___Black_rot","Apple___Cedar_apple_rust","Apple___healthy","Blueberry___healthy","Cherry_(including_sour)___healthy","Cherry_(including_sour)___Powdery_mildew","Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot","Corn_(maize)___Common_rust","Corn_(maize)___healthy","Corn_(maize)___Northern_Leaf_Blight","Grape___Black_rot","Grape___Esca_(Black_Measles)","Grape___healthy","Grape___Leaf_blight_(Isariopsis_Leaf_Spot)","Orange___Haunglongbing_(Citrus_greening)","Peach___Bacterial_spot","Peach___healthy","Pepper_bell___Bacterial_spot","Pepper_bell___healthy","Potato___Early_blight","Potato___healthy","Potato___Late_blight","Raspberry___healthy","Soybean___healthy","Squash___Powdery_mildew","Strawberry___healthy","Strawberry___Leaf_scorch","Tomato___Bacterial_spot","Tomato___Early_blight","Tomato___healthy","Tomato___Late_blight","Tomato___Leaf_Mold","Tomato___Septoria_leaf_spot","Tomato___Spider_mites Two-spotted_spider_mite","Tomato___Target_Spot","Tomato___Tomato_mosaic_virus","Tomato___Tomato_Yellow_Leaf_Curl_Virus"]
        disease_name = labels[predicted_label]

        # AI Insights (Using Gemini for domain-specific insights)
        insights = get_ai_insights(disease_name)
        
        # External product suggestions
        external_suggestions = get_external_products(disease_name)

        return jsonify({
            "label": disease_name,
            "confidence": float(confidence),
            "insights": insights,  # AI-generated insights
            "suggestions": {
                "external": external_suggestions  # External product recommendations
            },
            "message": "Prediction successful"
        }), 200
    except Exception as e:
        return jsonify({"error": f"Prediction failed: {str(e)}"}), 500
    finally:
        # Clean up the uploaded file
        os.remove(filepath)

'''
