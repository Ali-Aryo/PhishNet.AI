// Get references to HTML elements
const emailInput = document.getElementById('emailInput');
const evaluateButton = document.getElementById('evaluateButton');
const pasteButton = document.getElementById('pasteButton'); 
const loadingIndicator = document.getElementById('loadingIndicator');
const resultCard = document.getElementById('resultCard');
const predictionIcon = document.getElementById('predictionIcon');
const predictionText = document.getElementById('predictionText');
const errorMessage = document.getElementById('errorMessage');
const reportButton = document.getElementById('reportButton');

// Define your backend API URL
// IMPORTANT: Keep your Flask backend running locally on http://127.0.0.1:5000/
// If you deploy to Render later, CHANGE THIS to your Render URL (e.g., 'https://your-spam-api.onrender.com/predict').
const API_URL = 'http://127.0.0.1:5000/predict';

// Function to reset UI state
function resetUI() {
    resultCard.classList.add('hidden');
    // Ensure all glow classes are removed on reset
    resultCard.classList.remove('result-glow-not-spam', 'result-glow-spam');

    loadingIndicator.classList.add('hidden');
    evaluateButton.disabled = false;
    evaluateButton.textContent = 'Evaluate';
    predictionText.textContent = '';
    errorMessage.textContent = '';
    predictionIcon.className = 'prediction-icon'; // Reset icon classes
}

// Add event listener for the Paste button
pasteButton.addEventListener('click', async () => {
    errorMessage.textContent = ''; // Clear any previous errors

    try {
        // Check if the Clipboard API is supported by the browser and has readText method
        if (navigator.clipboard && navigator.clipboard.readText) {
            const clipboardText = await navigator.clipboard.readText();
            emailInput.value = clipboardText; // Paste the text into the textarea
        } else {
            errorMessage.textContent = 'Clipboard API not fully supported by your browser.';
            console.error('Clipboard API not fully supported or permission denied by default.');
            // Fallback for older browsers or if initial permission is denied:
            // Instruct user to manually paste.
        }
    } catch (err) {
        // This catch block handles cases where permission is denied or other errors occurs
        errorMessage.textContent = 'Failed to read from clipboard. Please grant permission or paste manually.';
        console.error('Failed to read clipboard contents: ', err);
    }
});


// Add an event listener to the evaluate button
evaluateButton.addEventListener('click', async () => {
    resetUI(); // Clear previous state

    const emailBody = emailInput.value.trim();

    if (!emailBody) {
        errorMessage.textContent = 'Please enter an email body to analyze.';
        return;
    }

    // Show loading indicator and disable button
    loadingIndicator.classList.remove('hidden');
    evaluateButton.disabled = true;
    evaluateButton.textContent = 'Analyzing...';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_body: emailBody }),
        });

        // Hide loading indicator regardless of success or failure
        loadingIndicator.classList.add('hidden');
        evaluateButton.disabled = false;
        evaluateButton.textContent = 'Evaluate';

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error || 'Unknown API error'}`);
        }

        const data = await response.json();

        // --- START OF MODIFIED PREDICTION HANDLING ---
        console.log('API response data:', data); // IMPORTANT: Check this in your browser console!
        // Normalize prediction string to lowercase and trim whitespace for robust comparison
        const receivedPrediction = data.prediction ? String(data.prediction).trim().toLowerCase() : null;

        if (receivedPrediction) {
            // Display the original prediction text from the API
            predictionText.textContent = data.prediction;
            resultCard.classList.remove('hidden'); // Show the result card

            // Update icon, text color, and ADD GLOW based on the normalized prediction
            if (receivedPrediction === 'spam') {
                predictionIcon.className = 'prediction-icon fas fa-times-circle prediction-spam'; // Red X icon
                predictionText.classList.remove('prediction-not-spam');
                predictionText.classList.add('prediction-spam');
                reportButton.classList.add('hidden'); // Hide report button for detected spam
                resultCard.classList.add('result-glow-spam'); // ADD RED GLOW TO CARD
                console.log('Prediction is SPAM. Added result-glow-spam class.'); // Debugging log
            } else if (receivedPrediction === 'not spam') { // Check for 'not spam' in lowercase
                predictionIcon.className = 'prediction-icon fas fa-check-circle prediction-not-spam'; // Green Check icon
                predictionText.classList.remove('prediction-spam');
                predictionText.classList.add('prediction-not-spam');
                reportButton.classList.remove('hidden'); // Show report button for non-spam
                resultCard.classList.add('result-glow-not-spam'); // ADD GREEN GLOW TO CARD
                console.log('Prediction is NOT SPAM. Added result-glow-not-spam class.'); // Debugging log
            } else {
                // Fallback for unexpected prediction values
                errorMessage.textContent = `Unexpected prediction value from API: "${data.prediction}".`;
                console.error('Unexpected prediction value from API:', data.prediction);
            }
        } else {
            errorMessage.textContent = 'API response missing or invalid "prediction" field.';
            console.error('API response missing or invalid prediction:', data);
        }
        // --- END OF MODIFIED PREDICTION HANDLING ---

    } catch (error) {
        // Hide loading indicator and re-enable button on error
        loadingIndicator.classList.add('hidden');
        evaluateButton.disabled = false;
        evaluateButton.textContent = 'Evaluate';

        errorMessage.textContent = `Error: ${error.message}`;
        console.error('Fetch error:', error);
    }
});

// Optional: Add functionality to the report phishing button
reportButton.addEventListener('click', () => {
    alert('Thank you for reporting! (This is a placeholder action.)');
    // Here you would typically send the emailBody to another backend endpoint
    // for actual reporting/feedback mechanisms.
});

// Initial UI reset on page load
resetUI();