
# 🎣 PhishNet.AI: Intelligent Phishing Detection

PhishNet.AI is a web application designed to detect and classify phishing attempts. Leveraging a trained machine learning model, it analyzes email, Google Chat, Slack, or other text content to identify malicious patterns, providing users with a tool to enhance their online security. Beyond basic detection, it includes an interactive learning mode to help users improve their own ability to spot phishing emails.

---

## Quick Links / Overview
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
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

- **Python 3.9+** (Recommended: Python 3.9 or 3.10)
- **Git** (for cloning the repository)
- **Visual Studio Code (VS Code)** (for code editing and Live Server)

---

## Requirements

### System Requirements
- Windows 10/11, macOS, or Linux
- At least 4GB RAM (8GB+ recommended for model training)
- Internet connection (for downloading dependencies and NLTK data)

### Python Package Requirements
All required Python packages are listed in `backend/requirements.txt`. Key packages include:

- Flask
- Flask-RESTX
- scikit-learn
- pandas
- joblib
- nltk
- imbalanced-learn
- numpy
- scipy
- matplotlib
- seaborn

To install all dependencies, use:
```sh
pip install -r requirements.txt
```

#### Additional Notes
- If you encounter issues with `pip`, ensure it is up to date: `python -m pip install --upgrade pip`
- For Apple Silicon (M1/M2) or Linux, some packages may require additional system libraries (e.g., `build-essential`, `python3-dev`).
- If you see errors related to `nltk` or `scikit-learn`, try reinstalling those packages individually.

---

---


## Installation & Setup

### 1. Clone the Repository
Get the latest project code onto your local machine from GitHub:
```sh
git clone https://github.com/Ali-Aryo/PhishNet.AI.git
cd PhishNet.AI
```

### 2. Backend Setup and Run
The backend provides the Machine Learning API that the frontend communicates with.

**a. Navigate to Backend Directory:**
```sh
cd backend
```

**b. Create & Activate Virtual Environment:**
```sh
python -m venv venv
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate
```

**c. Install Python Dependencies:**
```sh
pip install --upgrade pip
pip install -r requirements.txt
```

**d. Download NLTK Data:**
```sh
python -c "import nltk; nltk.download('stopwords')"
```

### FYI: What is NLTK and Why Do We Use It?

**NLTK (Natural Language Toolkit)** is a popular Python library for working with human language data (text). In this project, it's used to download and manage English stopwords—common words like "the", "is", and "and" that are removed during text preprocessing.

Removing these stopwords helps the machine learning model focus on the most meaningful words in an email, improving phishing detection accuracy. NLTK provides a reliable set of stopwords and text processing tools for this purpose.

**e. Run the Flask Backend Server:**
```sh
python app.py
```

**Troubleshooting:**
- If you see errors about missing modules, double-check your virtual environment is activated.
- For port conflicts, change the port in `app.py` or stop other services using port 5000.
- If you see errors about missing `.pkl` files, ensure `spam_classifier_model.pkl` and `tfidf_vectorizer.pkl` are present in the `backend` folder.

### 3. Frontend Setup and View
1. Open the project in VS Code.
2. Install the "Live Server" extension (search for it in the Extensions panel).
3. In the `frontend` folder, right-click `index.html` and select **Open with Live Server**.
4. Your web application will open in your default browser at `http://127.0.0.1:5500/frontend/index.html` (or similar).

**Note:** The frontend expects the backend to be running at `http://127.0.0.1:5000`. If you change the backend port, update the API URLs in your JavaScript files accordingly.

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

## Technologies Used


### Backend
- **Python**: Core backend logic
- **Flask**: Web framework for API
- **Flask-RESTX**: API documentation (Swagger UI)
- **Scikit-learn**: Machine learning (SVC, TfidfVectorizer)
- **Joblib**: Model persistence
- **Pandas**: Data manipulation
- **NLTK**: Natural Language Toolkit, used for text preprocessing 
- **Imblearn**: RandomUnderSampler for class imbalance
- **NumPy & SciPy**: Numerical operations
- **Matplotlib & Seaborn**: Visualizations (training phase)

---

### Frontend
- **HTML5, CSS3**: UI structure and styling
- **JavaScript**: Interactivity (script.js, learn.js)
- **Font Awesome**: Icons
- **Google Fonts (Inter)**: Typography
- **Live Server (VS Code Extension)**: Local development

### Data
- **CSV (SpamAssasin.csv)**: Dataset for training and learning mode

---
