from threading import Timer
from datetime import datetime
import os
from database.db import get_db
from services.email_service import send_email


# MongoDB Connection
db = get_db()
users_collection = db['users']

# Thresholds
UNKNOWN_IMAGE_THRESHOLD = 5
LABELLED_COUNT_THRESHOLD = 3

# Global flag to avoid multiple retraining triggers
is_retraining_in_progress = False

def start_retraining_pipeline():
    """Start the retraining pipeline by scheduling periodic checks."""
    print(f"Retraining pipeline started at {datetime.utcnow()}.")

    # Schedule periodic checks
    check_unknown_images()
    check_labeling_progress()

    # Repeat after 1 minute
    Timer(60, start_retraining_pipeline).start()  # 1800 seconds = 30 minutes

def check_unknown_images():
    """Check the count of unknown images and notify admins if it exceeds the threshold."""
    unknown_images_path = "unknown_images"
    num_unknown_images = len(os.listdir(unknown_images_path))

    if num_unknown_images > UNKNOWN_IMAGE_THRESHOLD:
        print(f"Unknown images exceed threshold: {num_unknown_images}. Notifying admins.")

        # Notify admins
        admins = users_collection.find({"role": "admin"})
        for admin in admins:
            send_email(
                admin['email'],
                "Unknown Image Threshold Exceeded",
                f"The number of unknown images has reached {num_unknown_images}. Please assign specialists for labeling."
            )

def check_labeling_progress():
    """Check if the total labeled images exceed the threshold for retraining."""
    global is_retraining_in_progress

    if is_retraining_in_progress:
        return  # Avoid multiple retraining triggers

    # Calculate total labeled images
    specialists = users_collection.find({"role": "specialist"})
    total_labelled_count = sum(specialist.get('labelled_count', 0) for specialist in specialists)

    print(f"Total labeled images: {total_labelled_count}")

    if total_labelled_count >= LABELLED_COUNT_THRESHOLD:
        print("Labeling threshold reached. Starting retraining...")

        is_retraining_in_progress = True  # Set flag

        try:
            # Run retraining script
            os.system('python "C:/files/major project/plant_disease_backend/services/retraining.py"')


            # Notify admins about retraining completion
            notify_admins_retraining_completed(total_labelled_count)

            # Reset labeled count
            users_collection.update_many({"role": "specialist"}, {"$set": {"labelled_count": 0}})
            print("Labeling counts reset after retraining.")
        except Exception as e:
            print(f"Retraining failed: {str(e)}")
        finally:
            is_retraining_in_progress = False  # Reset flag

def notify_admins_retraining_completed(labelled_count):
    """Send email notifications to all admins after retraining is completed."""
    admins = users_collection.find({"role": "admin"})
    for admin in admins:
        send_email(
            admin['email'],
            "Model Retrained Successfully",
            f"The model has been retrained successfully using {labelled_count} newly labeled images. "
            "You can now verify the updated model's performance."
        )
    print("Admins notified about retraining completion.")
