from threading import Thread
from plant import start_pipeline
from plant import app

if __name__ == '__main__':
    # Start the pipeline in a separate thread to avoid blocking the Flask app
    Thread(target=start_pipeline, daemon=True).start()

    # Start the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)