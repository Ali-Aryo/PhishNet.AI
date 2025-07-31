
# 🎣 PhishNet.AI: Intelligent Phishing Detection

PhishNet.AI is a web application designed to detect and classify phishing attempts. Leveraging a trained machine learning model, it analyzes email, Google Chat, Slack, or other text content to identify malicious patterns, providing users with a tool to enhance their online security. Beyond basic detection, it includes an interactive learning mode to help users improve their own ability to spot phishing emails.

---

## Quick Links / Overview
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)

---

## Features
- **Real-time Phishing Prediction:** Classifies email and text content as "Spam" or "Not Spam" using a pre-trained SVC model and TF-IDF vectorizer via a dedicated API. Users can input text manually or paste from the clipboard. The UI provides dynamic feedback with loading indicators, visual glows (red for Spam, green for Not Spam), and relevant icons. A "Report Phishing" button is available for non-spam results.
- **Interactive Learning Mode:** Enhances user skills by presenting challenge emails for classification. Users guess "Phishy" or "Not Phishy," then receive immediate feedback comparing their guess to the model's prediction and the true label. A "Next Email" button allows for continuous practice.
- **Comprehensive Web Interface:** A user-friendly frontend built with HTML, CSS, and JavaScript, offering seamless navigation between prediction and learning modes. The design features a modern, dark theme with high-contrast elements, clear typography, and interactive components.
- **Robust Flask-RESTX Backend:** Python-based Flask backend serving the machine learning model and managing API endpoints, complete with interactive Swagger UI documentation.
- **Automated Email Preprocessing:** Consistent text cleaning pipeline (removing special characters/numbers, lowercasing, stopwords removal) ensures accurate model predictions.
- **Machine Learning Pipeline:** Includes a full pipeline for model training: data loading/cleaning, TF-IDF vectorization, data splitting, SVC model training/evaluation, and RandomUnderSampler for class imbalance.

---

## Prerequisites
Before you start, ensure you have the following installed on your system:

- Python 3.9+
- Git
- Visual Studio Code (VS Code)

---

## Installation & Setup

### 1. Clone the Repository
Get the latest project code onto your local machine from GitHub.

```sh
git clone https://github.com/Ali-Aryo/PhishNet.AI.git
cd PhishNet.AI
```

### 2. Backend Setup and Run
The backend provides the Machine Learning API that the frontend communicates with.

Navigate to Backend Directory:
```sh
cd backend
```
Create & Activate Virtual Environment:
```sh
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```
Install Python Dependencies:
```sh
pip install -r requirements.txt
```
Download NLTK Data:
```sh
python -c "import nltk; nltk.download('stopwords')"
```
Run the Flask Backend Server:
```sh
python app.py
```

### 3. Frontend Setup and View
Open the project in VS Code. Install the "Live Server" extension. In the `frontend` folder, right-click `index.html` and select **Open with Live Server**. The app will open in your browser.

---

## Usage

### 1. Main Detector Page
- Enter or paste an email message into the text area.
- Click **Paste** to paste from clipboard.
- Click **Evaluate** to send the message to the backend for detection.
- The result card will show "Not Spam" (green) or "Spam" (red) with an icon.
- "Report Phishing" is a placeholder for future features.

### 2. Learning Mode
- Click the "Practice Your Phish Finding" card.
- An email is displayed; guess "Phishy" or "Not Phishy."
- View results and explanations.
- Click **Next Email** for more practice.

---

## Project Structure

```
PhishNet.AI/
├── backend/
│   ├── app.py
│   ├── requirements.txt
│   ├── spam_classifier_model.pkl
│   └── tfidf_vectorizer.pkl
├── frontend/
│   ├── index.html
│   ├── learn.html
│   ├── script.js
│   ├── learn.js
│   ├── style.css
│   └── images/
│       └── phishnet.png
├── Dataset/
│   ├── SpamAssasin.csv
│   └── README.md
└── README.md
```

---

## Technologies Used

### Backend
- **Python**: Core backend logic
- **Flask**: Web framework for API
- **Flask-RESTX**: API documentation (Swagger UI)
- **Scikit-learn**: Machine learning (SVC, TfidfVectorizer)
- **Joblib**: Model persistence
- **Pandas**: Data manipulation
- **NLTK**: Stopwords for preprocessing
- **Imblearn**: RandomUnderSampler for class imbalance
- **NumPy & SciPy**: Numerical operations
- **Matplotlib & Seaborn**: Visualizations (training phase)

### Frontend
- **HTML5, CSS3**: UI structure and styling
- **JavaScript**: Interactivity (script.js, learn.js)
- **Font Awesome**: Icons
- **Google Fonts (Inter)**: Typography
- **Live Server (VS Code Extension)**: Local development

### Data
- **CSV (SpamAssasin.csv)**: Dataset for training and learning mode

---

## License
This project is for educational and demonstration purposes.

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