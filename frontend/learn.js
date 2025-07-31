// Get references to HTML elements on the learning page
// NEW: This is the single div that holds all dynamic content
const challengeContentArea = document.getElementById('challengeContentArea'); 
const guessPhishyButton = document.getElementById('guessPhishy');
const guessNotPhishyButton = document.getElementById('guessNotPhishy');
const feedbackButtonsContainer = document.querySelector('.user-guess-buttons');
const learningResultSection = document.getElementById('learningResultSection');
const userGuessDisplay = document.getElementById('userGuessDisplay');
const modelPredictionDisplay = document.getElementById('modelPredictionDisplay');
const trueLabelDisplay = document.getElementById('trueLabelDisplay');
const explanationText = document.getElementById('explanationText');
const nextEmailButton = document.getElementById('nextEmailButton');
const learningErrorMessage = document.getElementById('learningErrorMessage');

// NEW: Progress circle elements
const userProgressCircle = document.getElementById('userProgress');
const modelProgressCircle = document.getElementById('modelProgress');
const userProgressText = document.getElementById('userProgressText');
const modelProgressText = document.getElementById('modelProgressText');

// Define your backend API URLs
const CHALLENGE_API_URL = 'http://127.0.0.1:5000/phishnet/get_challenge_email'; 
const FEEDBACK_API_URL = 'http://127.0.0.1:5000/phishnet/submit_learning_feedback';

let currentEmailData = null; 

// State for progress tracking
let totalEmailsSeen = 0;
let userCorrectGuesses = 0;
let modelCorrectGuesses = 0;

// Function to update the progress circles
function updateProgressCircles() {
    if (totalEmailsSeen === 0) {
        userProgressCircle.style.backgroundImage = 'none';
        modelProgressCircle.style.backgroundImage = 'none';
        userProgressText.textContent = '0%';
        modelProgressText.textContent = '0%';
        return;
    }
    const userPercentage = (userCorrectGuesses / totalEmailsSeen) * 100;
    const modelPercentage = (modelCorrectGuesses / totalEmailsSeen) * 100;

    userProgressCircle.style.backgroundImage = `conic-gradient(#28a745 ${userPercentage}%, #dc3545 0)`;
    modelProgressCircle.style.backgroundImage = `conic-gradient(#28a745 ${modelPercentage}%, #dc3545 0)`;
    
    userProgressText.textContent = `${Math.round(userPercentage)}%`;
    modelProgressText.textContent = `${Math.round(modelPercentage)}%`;
}

// Function to reset UI state for a new email challenge
function resetLearningUI() {
    // NEW: Inject the loading spinner and message directly into the container
    challengeContentArea.innerHTML = `
        <p class="loading-message">
            <div class="spinner"></div>
            Loading email...
        </p>
    `;
    
    // Hide other sections
    learningResultSection.classList.add('hidden'); 
    learningErrorMessage.textContent = '';
    feedbackButtonsContainer.classList.add('hidden'); 
    nextEmailButton.classList.add('hidden');

    // Reset guess buttons
    guessPhishyButton.disabled = false;
    guessNotPhishyButton.disabled = false;
    guessPhishyButton.classList.remove('selected-guess');
    guessNotPhishyButton.classList.remove('selected-guess');
}

// Function to fetch and display a new learning email challenge
async function fetchLearningEmail() {
    resetLearningUI(); // Always reset the UI before fetching a new email

    try {
        console.log(`Attempting to fetch a random email.`);
        const response = await fetch(CHALLENGE_API_URL);
        
        if (!response.ok) {
            if (response.status === 404) {
                challengeContentArea.innerHTML = '<p class="challenge-completed-message">You have completed all available challenges! Go back to the detector.</p>';
                learningErrorMessage.textContent = '';
                guessPhishyButton.disabled = true;
                guessNotPhishyButton.disabled = true;
                return null;
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        currentEmailData = await response.json();
        console.log('Received email data:', currentEmailData);

        if (currentEmailData && currentEmailData.content) {
            challengeContentArea.innerHTML = `<pre>${currentEmailData.content}</pre>`; // Place content directly
            feedbackButtonsContainer.classList.remove('hidden'); // Show the guess buttons
        } else {
            challengeContentArea.innerHTML = '<p class="error-loading-message">Error loading challenge. Invalid data.</p>';
            learningErrorMessage.textContent = "Invalid data received from API.";
            console.error("No content or invalid data in fetched email response:", currentEmailData);
            guessPhishyButton.disabled = true;
            guessNotPhishyButton.disabled = true;
        }

        return currentEmailData;
    } catch (error) {
        console.error('Error fetching learning email:', error); 
        challengeContentArea.innerHTML = '<p class="error-loading-message">Error loading challenge. Please try again.</p>';
        learningErrorMessage.textContent = `Failed to load email: ${error.message}. Please check console for details.`;
        guessPhishyButton.disabled = true;
        guessNotPhishyButton.disabled = true;
        return null;
    }
}

// Function to handle the user's guess (Phishy/Not Phishy)
async function handleUserGuess(userGuess) {
    if (!currentEmailData) {
        learningErrorMessage.textContent = 'No email loaded to evaluate!';
        return;
    }
    guessPhishyButton.disabled = true; 
    guessNotPhishyButton.disabled = true;

    // NEW: Update progress counters
    totalEmailsSeen++;
    const userIsCorrect = (userGuess === 'Phishy' && currentEmailData.true_label === 'Spam') || 
                          (userGuess === 'Not Phishy' && currentEmailData.true_label === 'Not Spam');
    if (userIsCorrect) {
        userCorrectGuesses++;
    }

    const modelIsCorrect = currentEmailData.model_prediction === currentEmailData.true_label;
    if (modelIsCorrect) {
        modelCorrectGuesses++;
    }

    // Update the progress circles and display text
    updateProgressCircles();

    if (userGuess === 'Phishy') {
        guessPhishyButton.classList.add('selected-guess');
    } else {
        guessNotPhishyButton.classList.add('selected-guess');
    }
    userGuessDisplay.textContent = userGuess;
    userGuessDisplay.classList.remove('prediction-spam', 'prediction-not-spam');
    userGuessDisplay.classList.add(userGuess === 'Phishy' ? 'prediction-spam' : 'prediction-not-spam');

    modelPredictionDisplay.textContent = currentEmailData.model_prediction;
    modelPredictionDisplay.classList.remove('prediction-spam', 'prediction-not-spam');
    modelPredictionDisplay.classList.add(currentEmailData.model_prediction === 'Spam' ? 'prediction-spam' : 'prediction-not-spam');

    if (currentEmailData.true_label) {
        trueLabelDisplay.textContent = currentEmailData.true_label;
        trueLabelDisplay.classList.remove('prediction-spam', 'prediction-not-spam');
        trueLabelDisplay.classList.add(currentEmailData.true_label === 'Spam' ? 'prediction-spam' : 'prediction-not-spam');
    } else {
        trueLabelDisplay.textContent = 'N/A';
        trueLabelDisplay.classList.add('prediction-not-spam');
    }
    explanationText.textContent = currentEmailData.explanation || 'No explanation provided.';
    learningResultSection.classList.remove('hidden'); 
    nextEmailButton.classList.remove('hidden'); 

    try {
        await fetch(FEEDBACK_API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email_id: currentEmailData.id,
                user_guess: userGuess,
                model_prediction: currentEmailData.model_prediction,
                true_label: currentEmailData.true_label,
                timestamp: new Date().toISOString(),
                message: currentEmailData.content
            })
        });
    } catch (feedbackError) {
        console.error('Error submitting feedback:', feedbackError);
    }
}

guessPhishyButton.addEventListener('click', () => handleUserGuess('Phishy'));
guessNotPhishyButton.addEventListener('click', () => handleUserGuess('Not Phishy'));

nextEmailButton.addEventListener('click', async () => {
    await fetchLearningEmail();
    if (challengeContentArea.closest('.card')) { 
        challengeContentArea.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

document.addEventListener('DOMContentLoaded', () => {
    fetchLearningEmail();
    updateProgressCircles(); // Also run on load to initialize with 0%
});