from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import json # NEW: For handling JSON (even if not saving feedback to file, good for logging)
import pandas as pd # NEW: For loading the dataset
import random # NEW: For selecting random emails for learning feature
from datetime import datetime # NEW: For timestamps in feedback (optional logging)

app = Flask(__name__) 
CORS(app)

# --- Configuration ---
MODEL_FILENAME = 'spam_classifier_model.pkl'
VECTORIZER_FILENAME = 'tfidf_vectorizer.pkl'
DATASET_FILE = 'SpamAssasin.csv' # NEW: Your main dataset file

# --- Global variables for loaded model, vectorizer, and learning data ---
model = None
vectorizer = None
learning_emails_df = None # NEW: DataFrame to hold emails for the learning feature

# --- Define NLTK stopwords (CRITICAL to be identical to Colab's preprocessing) ---
# Ensure NLTK stopwords are available in your backend env too:
# In your MINGW64 terminal, with venv active, run once:
# python -c "import nltk; nltk.download('stopwords')"
import re
import nltk
from nltk.corpus import stopwords

try:
    stop_words = set(stopwords.words('english'))
except LookupError:
    print("NLTK stopwords not found. Please run 'python -c \"import nltk; nltk.download(\'stopwords\')\"' in your terminal.")
    stop_words = set() # Fallback to empty set if not found

def clean_text_for_prediction(text):
    """Replicates the text cleaning logic from your Colab notebook."""
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = text.lower()
    words = text.split()
    filtered_words = [word for word in words if word not in stop_words]
    return ' '.join(filtered_words)

# --- Function to load the model and vectorizer ---
def load_assets():
    """Loads the trained model, TF-IDF vectorizer, and learning dataset."""
    global model, vectorizer, learning_emails_df # Declare learning_emails_df global
    
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

    # NEW: Load the dataset for learning emails (same as training data)
    try:
        # Construct path to SpamAssasin.csv relative to app.py
        # Assumes SpamAssasin.csv is in the 'dataset' folder, which is sibling to 'backend'
        dataset_path = os.path.join(os.path.dirname(__file__), '..', 'dataset', DATASET_FILE)
        
        # Fallback if the above path doesn't work (e.g., if dataset is directly in backend/ for testing)
        if not os.path.exists(dataset_path):
             dataset_path = os.path.join(os.path.dirname(__file__), DATASET_FILE) 
        
        if os.path.exists(dataset_path):
            df_full = pd.read_csv(dataset_path)
            # Apply the same cleaning as in Colab notebook
            df_full = df_full.drop('receiver', axis=1, errors='ignore') # 'errors=ignore' prevents error if 'receiver' column doesn't exist
            df_full = df_full.dropna(subset=['body', 'subject'])
            
            # For the learning feature, we need raw body and true label
            learning_emails_df = df_full[['body', 'label']].copy()
            # Add a unique ID for each email
            learning_emails_df['id'] = range(1, len(learning_emails_df) + 1) # IDs starting from 1
            print(f"Dataset for learning feature loaded from '{dataset_path}'. {len(learning_emails_df)} emails available.")
        else:
            print(f"Dataset '{DATASET_FILE}' not found at '{dataset_path}'. Learning feature will be disabled.")
            learning_emails_df = None
    except Exception as e:
        print(f"Error loading dataset for learning feature: {e}")
        learning_emails_df = None

# Load assets when the application starts
with app.app_context():
    load_assets()

# --- API Endpoint for Prediction (No changes from your provided version) ---
@app.route('/predict', methods=['POST'])
def predict():
    """
    Handles prediction requests for email spam classification.
    Expects JSON input with 'email_body' key containing the email text.
    """
    if model is None or vectorizer is None:
        return jsonify({'error': 'Model or Vectorizer not loaded. Cannot process prediction.'}), 500

    try:
        data = request.get_json(force=True)
        if 'email_body' not in data:
            return jsonify({'error': 'Missing "email_body" in request. Please send the email text.'}), 400

        raw_email_body = data['email_body']
        cleaned_email_body = clean_text_for_prediction(raw_email_body)
        processed_input = vectorizer.transform([cleaned_email_body])
        predictions = model.predict(processed_input)
        prediction_label = "Spam" if predictions[0] == 1 else "Not Spam"

        return jsonify({'prediction': prediction_label})

    except Exception as e:
        print(f"Error processing prediction request: {e}")
        return jsonify({'error': str(e)}), 500

# NEW API Endpoint: To retrieve a RANDOM challenge email for learning mode
@app.route('/get_challenge_email', methods=['GET']) # Removed <int:email_id>
def get_challenge_email():
    global learning_emails_df
    if learning_emails_df is None or learning_emails_df.empty:
        return jsonify({'error': 'Learning emails dataset not loaded or is empty.'}), 500

    # Select a random index for the email
    random_index = random.randint(0, len(learning_emails_df) - 1)
    email_data = learning_emails_df.iloc[random_index]
    
    email_body = email_data['body']
    true_label_raw = email_data['label'] # Raw label (0 or 1)
    true_label_display = "Spam" if true_label_raw == 1 else "Not Spam"

    # Get model's prediction for this email
    model_prediction_label = "N/A" # Default if model/vectorizer not ready
    if model is not None and vectorizer is not None:
        try:
            cleaned_body = clean_text_for_prediction(email_body)
            transformed_body = vectorizer.transform([cleaned_body])
            model_pred_raw = model.predict(transformed_body)[0]
            model_prediction_label = "Spam" if model_pred_raw == 1 else "Not Spam"
        except Exception as e:
            print(f"Error predicting on challenge email (random pick): {e}")
            model_prediction_label = "Prediction Error"

    return jsonify({
        'id': int(email_data['id']), # Convert to standard Python int
        'content': email_body,
        'true_label': true_label_display,
        'explanation': "This is a placeholder explanation for learning. In a real app, this would be a detailed reason why the email is phishing/not phishing.", # Generic explanation
        'model_prediction': model_prediction_label
    }), 200

# NEW API Endpoint: To receive user feedback on learning challenges (for logging)
@app.route('/submit_learning_feedback', methods=['POST'])
def submit_learning_feedback():
    """Receives user feedback on learning challenge (e.g., user's guess)."""
    try:
        feedback_data = request.get_json(force=True)
        # For a hackathon, we'll just print this to the backend console.
        # In a real application, you might save this to a file or database for later analysis.
        print(f"--- Received Learning Feedback ---")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Email ID: {feedback_data.get('id')}")
        print(f"User Guess: {feedback_data.get('user_guess')}")
        print(f"Model Prediction: {feedback_data.get('model_prediction')}")
        print(f"True Label: {feedback_data.get('true_label')}")
        print(f"Message Snippet: {feedback_data.get('message')[:100]}...") # Print first 100 chars
        print(f"----------------------------------")
        
        return jsonify({'status': 'success', 'message': 'Feedback received!'}), 200
    except Exception as e:
        print(f"Error receiving feedback: {e}")
        return jsonify({'error': str(e)}), 400

# --- Health Check / Root Route ---
@app.route('/')
def home():
    """Simple route to check if the API is running."""
    status = "running"
    if model is None or vectorizer is None:
        status = "running, but ML assets not loaded"
    if learning_emails_df is None:
        status += ", learning data not loaded"
    return jsonify(message=f"ML Model API is {status}. Send a POST request to /predict for predictions. Visit /get_challenge_email/<id> for learning challenges.")

# --- Run the Flask Application ---
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)