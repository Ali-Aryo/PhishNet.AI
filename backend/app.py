from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import numpy as np
import os
import json
import pandas as pd
import random
from datetime import datetime
from flask_restx import Api, Namespace, Resource, fields # NEW IMPORTS

app = Flask(__name__)
# Enable CORS for all origins, required for Live Server to talk to Flask
CORS(app)

# Initialize the Flask-RestX API
api = Api(
    app,
    version='1.0',
    title='PhishNet.AI API',
    description='A machine learning API for detecting phishing emails and a learning mode.',
    doc='/swagger-ui' # The URL for the Swagger UI page
)

# Create a namespace for our API endpoints
api_ns = Namespace('phishnet', description='PhishNet.AI API Endpoints')
api.add_namespace(api_ns)

# --- Configuration ---
MODEL_FILENAME = 'spam_classifier_model.pkl'
VECTORIZER_FILENAME = 'tfidf_vectorizer.pkl'
DATASET_FILE = 'SpamAssasin.csv'

# --- Global variables for loaded assets and learning data ---
model = None
vectorizer = None
learning_emails_df = None 

# Define NLTK stopwords (CRITICAL to be identical to Colab's preprocessing)
import re
import nltk
from nltk.corpus import stopwords

try:
    stop_words = set(stopwords.words('english'))
except LookupError:
    print("NLTK stopwords not found. Please run 'python -c \"import nltk; nltk.download(\'stopwords\')\"' in your terminal.")
    stop_words = set() 

def clean_text_for_prediction(text):
    """Replicates the text cleaning logic from your Colab notebook."""
    text = re.sub(r'[^a-zA-Z\s]', '', text)
    text = text.lower()
    words = text.split()
    filtered_words = [word for word in words if word not in stop_words]
    return ' '.join(filtered_words)

# --- Function to load the model and assets ---
def load_assets():
    """Loads the trained model, TF-IDF vectorizer, and learning dataset."""
    global model, vectorizer, learning_emails_df 
    
    # Load Model
    if os.path.exists(MODEL_FILENAME):
        try:
            model = joblib.load(MODEL_FILENAME)
            print(f"Trained SVC model '{MODEL_FILENAME}' loaded successfully!")
        except Exception as e:
            print(f"Error loading model from '{MODEL_FILENAME}': {e}")
            model = None
    # ... (Vectorizor and Dataset loading logic remains the same)
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

    # Load the dataset for learning emails (same as training data)
    try:
        dataset_path = os.path.join(os.path.dirname(__file__), '..', 'dataset', DATASET_FILE)
        if not os.path.exists(dataset_path):
             dataset_path = os.path.join(os.path.dirname(__file__), DATASET_FILE) 
        
        if os.path.exists(dataset_path):
            df_full = pd.read_csv(dataset_path)
            df_full = df_full.drop('receiver', axis=1, errors='ignore')
            df_full = df_full.dropna(subset=['body', 'subject'])
            
            learning_emails_df = df_full[['body', 'label']].copy()
            learning_emails_df['id'] = range(1, len(learning_emails_df) + 1)
            print(f"Dataset for learning feature loaded from '{dataset_path}'. {len(learning_emails_df)} emails available.")
        else:
            print(f"Dataset '{DATASET_FILE}' not found at '{dataset_path}'. Learning feature will be disabled.")
            learning_emails_df = None
    except Exception as e:
        print(f"Error loading dataset for learning feature: {e}")
        learning_emails_df = None

with app.app_context():
    load_assets()

# --- Define API Models for Swagger/OpenAPI Documentation ---
predict_request_model = api_ns.model('PredictRequest', {
    'email_body': fields.String(required=True, description='The body of the email to be analyzed.')
})

predict_response_model = api_ns.model('PredictResponse', {
    'prediction': fields.String(description='The model\'s prediction: "Spam" or "Not Spam".')
})

challenge_response_model = api_ns.model('ChallengeEmail', {
    'id': fields.Integer(description='The unique ID of the email challenge.'),
    'content': fields.String(description='The full text content of the email.'),
    'true_label': fields.String(description='The actual label of the email from the dataset.'),
    'model_prediction': fields.String(description='The model\'s prediction for this email.'),
    'explanation': fields.String(description='An explanation for the email\'s classification.')
})

feedback_request_model = api_ns.model('FeedbackRequest', {
    'email_id': fields.Integer(required=True, description='The ID of the email challenge.'),
    'user_guess': fields.String(required=True, description='The user\'s guess: "Phishy" or "Not Phishy".'),
    'model_prediction': fields.String(required=True, description='The model\'s prediction for this email.'),
    'true_label': fields.String(required=True, description='The true label from the dataset.'),
    'timestamp': fields.String(description='ISO timestamp of the feedback submission.'),
    'message': fields.String(required=True, description='The email content submitted for feedback.')
})

feedback_response_model = api_ns.model('FeedbackResponse', {
    'status': fields.String(description='Status of the feedback submission.'),
    'message': fields.String(description='A message about the submission.')
})

# --- API Endpoint for Prediction ---
@api_ns.route('/predict')
class Predict(Resource):
    @api_ns.doc('Predicts if an email is spam')
    @api_ns.expect(predict_request_model)
    @api_ns.marshal_with(predict_response_model)
    def post(self):
        """Classifies an email as Spam or Not Spam."""
        if model is None or vectorizer is None:
            api.abort(500, 'Model or Vectorizer not loaded. Cannot process prediction.')

        data = request.get_json(force=True)
        raw_email_body = data['email_body']
        
        try:
            cleaned_email_body = clean_text_for_prediction(raw_email_body)
            processed_input = vectorizer.transform([cleaned_email_body])
            predictions = model.predict(processed_input)
            prediction_label = "Spam" if predictions[0] == 1 else "Not Spam"
            return {'prediction': prediction_label}
        except Exception as e:
            api.abort(400, f'Error processing prediction: {str(e)}')

# --- API Endpoint for Learning Feature ---
@api_ns.route('/get_challenge_email')
class GetChallengeEmail(Resource):
    @api_ns.doc('Gets a random challenge email for learning mode')
    @api_ns.marshal_with(challenge_response_model)
    def get(self):
        """Returns a random email challenge from the loaded dataset."""
        global learning_emails_df
        if learning_emails_df is None or learning_emails_df.empty:
            api.abort(500, 'Learning emails dataset not loaded or is empty.')

        random_index = random.randint(0, len(learning_emails_df) - 1)
        email_data = learning_emails_df.iloc[random_index]
        
        email_body = str(email_data['body']) # Ensure body is string
        true_label_raw = email_data['label']
        true_label_display = "Spam" if true_label_raw == 1 else "Not Spam"

        model_prediction_label = "N/A"
        if model is not None and vectorizer is not None:
            try:
                cleaned_body = clean_text_for_prediction(email_body)
                transformed_body = vectorizer.transform([cleaned_body])
                model_pred_raw = model.predict(transformed_body)[0]
                model_prediction_label = "Spam" if model_pred_raw == 1 else "Not Spam"
            except Exception as e:
                print(f"Error predicting on challenge email: {e}")
                model_prediction_label = "Prediction Error"

        return {
            'id': int(email_data['id']),
            'content': email_body,
            'true_label': true_label_display,
            'explanation': "This is a placeholder explanation for learning. In a real app, this would be a detailed reason.",
            'model_prediction': model_prediction_label
        }

@api_ns.route('/submit_learning_feedback')
class SubmitLearningFeedback(Resource):
    @api_ns.doc('Submits user feedback on a learning challenge')
    @api_ns.expect(feedback_request_model)
    @api_ns.marshal_with(feedback_response_model)
    def post(self):
        """Receives user feedback on learning challenges."""
        feedback_data = request.get_json(force=True)
        print(f"--- Received Learning Feedback ---")
        print(f"Timestamp: {datetime.now().isoformat()}")
        print(f"Email ID: {feedback_data.get('email_id')}")
        print(f"User Guess: {feedback_data.get('user_guess')}")
        print(f"Model Prediction: {feedback_data.get('model_prediction')}")
        print(f"True Label: {feedback_data.get('true_label')}")
        print(f"Message Snippet: {feedback_data.get('message')[:100]}...")
        print(f"----------------------------------")
        
        return {'status': 'success', 'message': 'Feedback received!'}

# --- Health Check / Root Route ---
@app.route('/')
def home():
    status = "running"
    if model is None or vectorizer is None:
        status = "running, but ML assets not loaded"
    if learning_emails_df is None:
        status += ", learning data not loaded"
    return jsonify(message=f"ML Model API is {status}. Visit /swagger-ui for API documentation.")

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)