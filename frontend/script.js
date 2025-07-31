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
const probabilityText = document.getElementById('probabilityText'); // NEW: Get probability span

// Define your backend API URL
const API_URL = 'http://127.0.0.1:5000/phishnet/predict';

// Function to reset UI state
function resetUI() {
    resultCard.classList.add('hidden');
    resultCard.classList.remove('result-glow-not-spam', 'result-glow-spam');

    loadingIndicator.classList.add('hidden');
    evaluateButton.disabled = false;
    evaluateButton.textContent = 'Evaluate';
    predictionText.textContent = '';
    probabilityText.textContent = ''; // NEW: Clear probability text
    errorMessage.textContent = '';
    predictionIcon.className = 'prediction-icon';
}

// Add event listener for the Paste button
pasteButton.addEventListener('click', async () => {
    errorMessage.textContent = '';
    try {
        if (navigator.clipboard && navigator.clipboard.readText) {
            const clipboardText = await navigator.clipboard.readText();
            emailInput.value = clipboardText;
        } else {
            errorMessage.textContent = 'Clipboard API not fully supported by your browser.';
            console.error('Clipboard API not fully supported or permission denied by default.');
        }
    } catch (err) {
        errorMessage.textContent = 'Failed to read from clipboard. Please grant permission or paste manually.';
        console.error('Failed to read clipboard contents: ', err);
    }
});

// Add an event listener to the evaluate button
evaluateButton.addEventListener('click', async () => {
    resetUI();
    const emailBody = emailInput.value.trim();
    if (!emailBody) {
        errorMessage.textContent = 'Please enter an email body to analyze.';
        return;
    }
    loadingIndicator.classList.remove('hidden');
    evaluateButton.disabled = true;
    evaluateButton.textContent = 'Analyzing...';
    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email_body: emailBody }),
        });
        loadingIndicator.classList.add('hidden');
        evaluateButton.disabled = false;
        evaluateButton.textContent = 'Evaluate';
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`HTTP error! Status: ${response.status} - ${errorData.error || 'Unknown API error'}`);
        }
        const data = await response.json();
        console.log('API response data:', data);

        const receivedPrediction = data.prediction ? String(data.prediction).trim().toLowerCase() : null;

        if (receivedPrediction) {
            predictionText.textContent = data.prediction;
            probabilityText.textContent = `${Math.round(data.probability * 100)}%`; // NEW: Display probability
            resultCard.classList.remove('hidden');
            if (receivedPrediction === 'spam') {
                predictionIcon.className = 'prediction-icon fas fa-times-circle prediction-spam';
                predictionText.classList.remove('prediction-not-spam');
                predictionText.classList.add('prediction-spam');
                reportButton.classList.add('hidden');
                resultCard.classList.add('result-glow-spam');
            } else if (receivedPrediction === 'not spam') {
                predictionIcon.className = 'prediction-icon fas fa-check-circle prediction-not-spam';
                predictionText.classList.remove('prediction-spam');
                predictionText.classList.add('prediction-not-spam');
                reportButton.classList.remove('hidden');
                resultCard.classList.add('result-glow-not-spam');
            } else {
                errorMessage.textContent = `Unexpected prediction value from API: "${data.prediction}".`;
                console.error('Unexpected prediction value from API:', data.prediction);
            }
        } else {
            errorMessage.textContent = 'API response missing or invalid "prediction" field.';
            console.error('API response missing or invalid prediction:', data);
        }
    } catch (error) {
        loadingIndicator.classList.add('hidden');
        evaluateButton.disabled = false;
        evaluateButton.textContent = 'Evaluate';
        errorMessage.textContent = `Error: ${error.message}`;
        console.error('Fetch error:', error);
    }
});

reportButton.addEventListener('click', () => {
    alert('Thank you for reporting! (This is a placeholder action.)');
});
resetUI();