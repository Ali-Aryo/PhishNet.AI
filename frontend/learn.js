// Get references to HTML elements on the learning page
// challengeContentArea is the main div that holds the message content (loading, email, error)
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
const learningErrorMessage = document.getElementById('learningErrorMessage'); // For general errors

// Define your backend API URL for learning feature (NO ID needed now)
const CHALLENGE_API_URL = 'http://127.0.0.1:5000/get_challenge_email'; 
const FEEDBACK_API_URL = 'http://127.0.0.1:5000/submit_learning_feedback';

let currentEmailData = null; // Store the current email data (including hidden true_label)

// Function to reset UI state for a new email challenge
function resetLearningUI() {
    // Show initial loading state within the content area
    challengeContentArea.innerHTML = `
        <p class="loading-message">
            <div class="spinner"></div>
            Loading email...
        </p>
    `;
    
    // Hide other sections
    learningResultSection.classList.add('hidden'); 
    learningErrorMessage.textContent = ''; // Clear previous errors
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
        console.log(`Attempting to fetch a random email.`); // Debugging log
        const response = await fetch(CHALLENGE_API_URL); // Fetch from the endpoint without ID
        
        if (!response.ok) {
            if (response.status === 404) {
                challengeContentArea.innerHTML = '<p class="challenge-completed-message">You have completed all available challenges! Go back to the detector.</p>';
                learningErrorMessage.textContent = ''; // Clear other error message
                guessPhishyButton.disabled = true;
                guessNotPhishyButton.disabled = true;
                return null; // Indicate no more emails
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Parse the JSON response from the backend
        currentEmailData = await response.json();
        console.log('Received email data:', currentEmailData); // Debugging log

        // Check if valid email content was received
        if (currentEmailData && currentEmailData.content) {
            challengeContentArea.innerHTML = `<pre>${currentEmailData.content}</pre>`; // Place content directly
            feedbackButtonsContainer.classList.remove('hidden'); // Show the guess buttons
        } else {
            // Handle cases where content is missing or invalid in the response
            challengeContentArea.innerHTML = '<p class="error-loading-message">Error loading challenge. Invalid data.</p>';
            learningErrorMessage.textContent = "Invalid data received from API.";
            console.error("No content or invalid data in fetched email response:", currentEmailData);
            guessPhishyButton.disabled = true;
            guessNotPhishyButton.disabled = true;
        }

        return currentEmailData; // Return the loaded email data
    } catch (error) {
        // Handle network errors or other fetch-related issues
        console.error('Error fetching learning email:', error); 
        challengeContentArea.innerHTML = '<p class="error-loading-message">Error loading challenge. Please try again.</p>';
        learningErrorMessage.textContent = `Failed to load email: ${error.message}. Please check console for details.`;
        guessPhishyButton.disabled = true;
        guessNotPhishyButton.disabled = true;
        return null; // Indicate that an error occurred
    }
}

// Function to handle the user's guess (Phishy/Not Phishy)
async function handleUserGuess(userGuess) {
    if (!currentEmailData) {
        learningErrorMessage.textContent = 'No email loaded to evaluate!';
        return;
    }

    guessPhishyButton.disabled = true; // Disable guess buttons once a choice is made
    guessNotPhishyButton.disabled = true;

    // Highlight the user's selected guess button
    if (userGuess === 'Phishy') {
        guessPhishyButton.classList.add('selected-guess');
    } else {
        guessNotPhishyButton.classList.add('selected-guess');
    }

    // Display the user's guess
    userGuessDisplay.textContent = userGuess;
    userGuessDisplay.classList.remove('prediction-spam', 'prediction-not-spam'); 
    userGuessDisplay.classList.add(userGuess === 'Phishy' ? 'prediction-spam' : 'prediction-not-spam');

    // Display the model's prediction
    modelPredictionDisplay.textContent = currentEmailData.model_prediction;
    modelPredictionDisplay.classList.remove('prediction-spam', 'prediction-not-spam');
    modelPredictionDisplay.classList.add(currentEmailData.model_prediction === 'Spam' ? 'prediction-spam' : 'prediction-not-spam');

    // Display the true label (if available in the fetched data)
    if (currentEmailData.true_label) {
        trueLabelDisplay.textContent = currentEmailData.true_label;
        trueLabelDisplay.classList.remove('prediction-spam', 'prediction-not-spam');
        trueLabelDisplay.classList.add(currentEmailData.true_label === 'Spam' ? 'prediction-spam' : 'prediction-not-spam');
    } else {
        trueLabelDisplay.textContent = 'N/A'; // Default if true label is not provided
        trueLabelDisplay.classList.add('prediction-not-spam'); 
    }

    // Display explanation
    explanationText.textContent = currentEmailData.explanation || 'No explanation provided.';

    // Show the result section and the "Next Email" button
    learningResultSection.classList.remove('hidden'); 
    nextEmailButton.classList.remove('hidden'); 

    // Optional: Send feedback to the backend for logging/analysis
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

// Add event listeners for the guess buttons
guessPhishyButton.addEventListener('click', () => handleUserGuess('Phishy'));
guessNotPhishyButton.addEventListener('click', () => handleUserGuess('Not Phishy'));

// Add event listener for the "Next Email" button
nextEmailButton.addEventListener('click', async () => {
    // currentEmailId++; // No longer incrementing ID for random selection
    await fetchLearningEmail(); // Just fetch the next random challenge
    
    // Scroll the entire card into view after loading new content for better UX
    if (challengeContentArea.closest('.card')) { 
        challengeContentArea.closest('.card').scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
});

// Load the first email challenge when the page finishes loading
document.addEventListener('DOMContentLoaded', fetchLearningEmail);