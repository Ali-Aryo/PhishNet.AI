PhishNet.AI
🎣 PhishNet.AI: Intelligent Phishing Detection
PhishNet.AI is a web application designed to detect and classify phishing attempts. Leveraging a trained machine learning model, it analyzes email, Google Chat, Slack or other text content to identify malicious patterns, providing users with a tool to enhance their online security. Beyond basic detection, it includes an interactive learning mode to help users improve their own ability to spot phishing emails.

Quick Links / Overview
Features

Prerequisites

Installation & Setup

Usage

Project Structure

Prerequisites
Before you start, ensure you have the following installed on your system:

Python 3.9+

Git

Visual Studio Code (VS Code)

Installation & Setup
To get PhishNet.AI up and running on your local machine, follow these detailed steps:

1. Clone the Repository
Get the latest project code onto your local machine from GitHub.

Open your Git Bash (MINGW64) terminal (or any terminal where Git commands work). Navigate to the directory where you store your GitHub repositories (e.g., ~/Desktop/Github Repos/).

cd "~/Desktop/Github Repos/" # Use quotes for paths with spaces

Clone the project repository. Replace https://github.com/Ali-Aryo/PhishNet.AI.git with the actual URL of your team's GitHub repository if it's different.

git clone https://github.com/Ali-Aryo/PhishNet.AI.git

Navigate into the newly cloned project directory:

cd PhishNet.AI # Replace PhishNet.AI with the actual name of the folder created by cloning.

2. Backend Setup and Run
The backend provides the Machine Learning API that the frontend communicates with.

Navigate to Backend Directory
From your project's root directory in the terminal, move into the backend folder:

cd backend

Create & Activate Virtual Environment
A virtual environment isolates your project's Python dependencies.

Create the virtual environment:

python -m venv venv

Note for other users: If python -m venv venv doesn't work, try py -m venv venv or use the full path to your Python executable if it's not in your PATH.

Activate the Virtual Environment:

On Windows (Git Bash/MinGW64):

source venv/Scripts/activate

On macOS/Linux:

source venv/bin/activate

Expected: Your terminal prompt will change to start with (venv), e.g., (venv) user@host ~/path/to/backend$. This indicates the virtual environment is active.

Install Python Dependencies
All required libraries are listed in requirements.txt. With the virtual environment activated, install the dependencies:

pip install -r requirements.txt

Note: This step will take several minutes, especially for larger libraries like tensorflow and scikit-learn. Please be patient.

Download NLTK Data
Your text preprocessing requires NLTK stopwords data. With the virtual environment still activated, download the NLTK stopwords:

python -c "import nltk; nltk.download('stopwords')"

Run the Flask Backend Server
This will start your ML API, listening for requests from the frontend. In the same terminal where your virtual environment is active, run the Flask app:

python app.py

Expected Output: You should see messages confirming:

Trained SVC model 'spam_classifier_model.pkl' loaded successfully!

TF-IDF vectorizer 'tfidf_vectorizer.pkl' loaded successfully!

Flask serving on http://127.0.0.1:5000.

Messages about challenge_emails.json loading.

Keep this terminal window open and running. Your frontend will communicate with this server.

3. Frontend Setup and View
The frontend is your user interface.

Open Project in VS Code
Open Visual Studio Code.

Go to File > Open Folder...

Navigate to and select the root folder of your cloned repository (e.g., PhishNet.AI).

Install "Live Server" Extension
In VS Code, go to the Extensions view (click the square icon on the sidebar, or press Ctrl+Shift+X / Cmd+Shift+X). Search for "Live Server" by Ritwick Dey and click "Install".

Open Frontend with Live Server
In VS Code's Explorer panel, navigate into the frontend folder.

Right-click on index.html.

Select "Open with Live Server".

Your web application will automatically open in your default web browser.

Usage
1. Main Detector Page
Enter Message: Type or paste an email message into the large text area.

"Paste" Button: Click this button to automatically paste content from your clipboard into the input box.

"Evaluate" Button: Click this to send the message to the backend for spam detection. Observe the loading animation.

The result card will appear with a green glow ("Not Spam") or a red glow ("Spam") along with an icon.

"Report Phishing" Button: (Appears for "Not Spam" results) - This is a placeholder for future functionality.

2. Learning Mode
From the main page, click the "Practice Your Phish Finding 🎣 🐠 ->" card.

Is this message Phishy? An email content will be displayed.

Make Your Guess: Click either the "Phishy" or "Not Phishy" button.

View Results: The section below will reveal your guess, the model's prediction, the true label, and an explanation.

"Next Email" Button: Click to load the next challenge email.

Features
Real-time Phishing Prediction: Classifies email and text content as "Spam" or "Not Spam" using a pre-trained SVC model and TF-IDF vectorizer via a dedicated API. Users can input text manually or paste from the clipboard. The UI provides dynamic feedback with loading indicators, visual glows (red for Spam, green for Not Spam), and relevant icons. A "Report Phishing" button is available for non-spam results.

Interactive Learning Mode: Enhances user skills by presenting challenge emails for classification. Users guess "Phishy" or "Not Phishy," then receive immediate feedback comparing their guess to the model's prediction and the true label. A "Next Email" button allows for continuous practice.

Comprehensive Web Interface: A user-friendly frontend built with HTML, CSS, and JavaScript, offering seamless navigation between prediction and learning modes. The design features a modern, dark theme with high-contrast elements, clear typography (Inter font), and interactive components with gradients and shadows.

Robust Flask-RESTX Backend: Python-based Flask backend serving the machine learning model and managing API endpoints, complete with interactive Swagger UI documentation.

Automated Email Preprocessing: Consistent text cleaning pipeline (removing special characters/numbers, lowercasing, stopwords removal) ensures accurate model predictions.

Machine Learning Pipeline: Includes a full pipeline for model training: data loading/cleaning, TF-IDF vectorization, data splitting, SVC model training/evaluation (Accuracy, ROC AUC, Classification Report), and RandomUnderSampler for class imbalance.

Technologies Used
Backend:

Python: The core programming language for the backend logic.

Flask: A lightweight web framework for building the API.

Flask-RESTX: Extends Flask to provide a fast, easy, and documented way to build REST APIs, including automatic Swagger UI generation.

Scikit-learn: Essential for the machine learning models, specifically SVC for classification and TfidfVectorizer for text feature extraction.

Joblib: For efficient loading and saving of Python objects, used to persist the trained ML model and TF-IDF vectorizer.

Pandas: For robust data manipulation, including loading the SpamAssassin.csv dataset, cleaning, and preparing data for both training and the learning feature.

NLTK (Natural Language Toolkit): Used for managing English stopwords during text preprocessing.

re (Regular Expressions): For cleaning text by removing non-alphabetic characters.

Imblearn (Imbalanced-learn): Specifically RandomUnderSampler for handling class imbalance in the training data.

NumPy & SciPy: Fundamental libraries for numerical operations, used extensively by scikit-learn and for data handling.

Matplotlib & Seaborn: Used for generating visualizations of model performance (e.g., ROC curves, confusion matrices) during the training phase.

Other Dependencies: Includes requests, certifi, urllib3, Werkzeug, Jinja2, itsdangerous, MarkupSafe, click, colorama, blinker, aniso8601, jsonschema, referencing, rpds-py, jsonschema-specifications, charset-normalizer, idna, python-dateutil, pytz, tzdata, packaging, setuptools, wheel, tqdm, rich, regex, threadpoolctl, pillow, six, wrapt, typing_extensions, importlib_resources, absl-py, astunparse, attrs, flatbuffers, gast, google-pasta, grpcio, h5py, keras, libclang, Markdown, markdown-it-py, MarkupSafe, mdurl, ml_dtypes, namex, opt_einsum, optree, protobuf, Pygments, tensorboard, tensorboard-data-server, tensorflow, termcolor.

Frontend:

HTML5: Structures the web pages (index.html, learn.html).

CSS3: Styles the application for a clean and responsive user experience (style.css).

Modern Dark Theme: The application features a sleek, dark background (#0d0d0d) with light text (#e0e0e0) and vibrant cyan (#00ffff) accents, creating a high-contrast and modern aesthetic.

Typography: Utilizes the 'Inter' Google Font for consistent and legible text throughout the application.

Card-based Layout: Content is organized into distinct, rounded cards (.card) with subtle shadows and borders, providing clear visual separation. Hover effects on cards add interactivity.

Dynamic Visual Feedback: Prediction results are enhanced with glowing effects on the result card (green for "Not Spam," red for "Spam") and corresponding icon/text colors, providing immediate and intuitive feedback to the user.

Interactive Elements: Buttons (.sleek-button, .action-button, .report-button, .guess-button, .back-button) feature gradients, shadows, and smooth hover/active transitions for a polished and engaging user experience.

Loading Indicators: Custom CSS animations create a spinning loader for a clear "Analyzing..." state.

Responsive Design: The layout is designed to be responsive, adapting to various screen sizes with max-width and flexible box models to ensure optimal viewing on both desktop and mobile devices.

JavaScript: Powers the interactive elements, handles API calls to the backend, and manages the logic for both the prediction and learning modes (script.js, learn.js).

script.js: Drives the main phishing prediction functionality on index.html. It manages user input from the textarea (including clipboard pasting), sends the email content to the backend's /predict API endpoint, handles loading states, and dynamically updates the UI with the prediction result (text, icon, and a visual glow effect). It also includes a placeholder for reporting phishing emails.

learn.js: Manages the interactive "Learning Mode." It handles fetching random email challenges from the Flask backend (/get_challenge_email), displaying them to the user, capturing user guesses ("Phishy" or "Not Phishy"), and then revealing the correct answer along with the model's prediction. It also sends user feedback back to the backend (/submit_learning_feedback) and controls the UI flow (showing/hiding sections, enabling/disabling buttons, displaying loading states and error messages).

Font Awesome: Used for icons to enhance the user interface (e.g., prediction icons, report button icon).

Google Fonts (Inter): Provides a modern and legible typeface for the application.

Data:

CSV (SpamAssassin.csv): The primary dataset located in the Dataset/ directory, used for both training the machine learning model and providing emails for the interactive learning challenges.

"