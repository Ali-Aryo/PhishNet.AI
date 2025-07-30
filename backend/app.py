from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib # Changed from tensorflow as you're using scikit-learn for the model
import numpy as np
import os

app = Flask(__name__)
CORS(app)

# --- Configuration ---
MODEL_FILENAME = 'spam_classifier_model.pkl' # Updated filename for your SVC model
VECTORIZER_FILENAME = 'tfidf_vectorizer.pkl' # New filename for your TF-IDF vectorizer

# --- Global variables for loaded model and vectorizer ---
model = None
vectorizer = None # New variable for the vectorizer

# --- Function to load the model and vectorizer ---
def load_assets():
    """Loads the trained model and TF-IDF vectorizer."""
    global model, vectorizer
    
    # Load Model
    if os.path.exists(MODEL_FILENAME):
        try:
            model = joblib.load(MODEL_FILENAME)
            print(f"Trained SVC model '{MODEL_FILENAME}' loaded successfully!")
        except Exception as e:
            print(f"Error loading model from '{MODEL_FILENAME}': {e}")
            model = None
    else:
        print(f"Model file '{MODEL_FILENAME}' not found. Prediction requests will fail.")
        model = None

    # Load Vectorizer
    if os.path.exists(VECTORIZER_FILENAME):
        try:
            vectorizer = joblib.load(VECTORIZER_FILENAME)
            print(f"TF-IDF vectorizer '{VECTORIZER_FILENAME}' loaded successfully!")
        except Exception as e:
            print(f"Error loading vectorizer from '{VECTORIZER_FILENAME}': {e}")
            vectorizer = None
    else:
        print(f"Vectorizer file '{VECTORIZER_FILENAME}' not found. Prediction requests will fail.")
        vectorizer = None

# Load assets when the application starts
with app.app_context():
    load_assets()

# --- API Endpoint for Prediction ---
@app.route('/predict', methods=['POST'])
def predict():
    """
    Handles prediction requests for email spam classification.
    Expects JSON input with 'email_body' key containing the email text.
    """
    if model is None or vectorizer is None:
        return jsonify({'error': 'Model or Vectorizer not loaded. Cannot process prediction.'}), 500

    try:
        # Get the JSON data from the request body
        data = request.get_json(force=True)

        # --- IMPORTANT: Extract and Preprocess Input Email Body ---
        if 'email_body' not in data: # Changed key from 'input_data' to 'email_body'
            return jsonify({'error': 'Missing "email_body" in request. Please send the email text.'}), 400

        raw_email_body = data['email_body']

        # --- Clean the email text (MUST MATCH YOUR COLAB'S clean_text FUNCTION) ---
        # You need to replicate the clean_text function here
        import re
        from nltk.corpus import stopwords # You'll need to download these if not already in your venv
        # Ensure NLTK stopwords are available in your backend env too
        # In your MINGW64 terminal, with venv active:
        # python -c "import nltk; nltk.download('stopwords')"
        
        stop_words = set(stopwords.words('english')) # Define stop_words here

        def clean_text_for_prediction(text): # Renamed to avoid confusion
            text = re.sub(r'[^a-zA-Z\s]', '', text)
            text = text.lower()
            words = text.split()
            filtered_words = [word for word in words if word not in stop_words]
            return ' '.join(filtered_words)

        cleaned_email_body = clean_text_for_prediction(raw_email_body)

        # --- Transform the cleaned email using the loaded TF-IDF vectorizer ---
        # The vectorizer expects an iterable (list) of strings
        processed_input = vectorizer.transform([cleaned_email_body])

        # --- Make Prediction ---
        predictions = model.predict(processed_input)

        # --- Post-process Output ---
        # Your model predicts 0 (not spam) or 1 (spam)
        prediction_label = "Spam" if predictions[0] == 1 else "Not Spam"

        # If you wanted probability (requires probability=True on SVC init in Colab):
        # probabilities = model.predict_proba(processed_input)
        # spam_probability = float(probabilities[0][1]) # Probability of being spam (class 1)
        # return jsonify({'prediction': prediction_label, 'spam_probability': spam_probability})

        return jsonify({'prediction': prediction_label})

    except Exception as e:
        print(f"Error processing prediction request: {e}")
        return jsonify({'error': str(e)}), 500

# --- Health Check / Root Route ---
@app.route('/')
def home():
    """Simple route to check if the API is running."""
    status = "running"
    if model is None or vectorizer is None:
        status = "running, but model or vectorizer not loaded"
    return jsonify(message=f"ML Model API is {status}. Send a POST request to /predict for predictions.")

# --- Run the Flask Application ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)