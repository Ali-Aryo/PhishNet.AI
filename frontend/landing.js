// Get references to the video and the main content container
const introVideoContainer = document.getElementById('introVideoContainer');
const mainContentContainer = document.getElementById('mainContentContainer');
const landingContentWrapper = document.getElementById('landingContentWrapper');
const introVideo = document.getElementById('introVideo');

// This function manages the final transition from video to main content
function transitionToMainContent() {
    // 1. Set the video container to fade out
    introVideoContainer.style.opacity = '0';
    sessionStorage.setItem('hasPlayedIntro', 'true'); // Set the flag so it doesn't play again

    // 2. Wait for the video's fade-out to complete (1 second)
    setTimeout(() => {
        // 3. Hide the video container completely and show the main content
        introVideoContainer.classList.add('hidden');
        mainContentContainer.classList.remove('hidden');

        // 4. Use a tiny delay to ensure the browser registers the state change,
        //    which makes the opacity transition smooth.
        setTimeout(() => {
            landingContentWrapper.classList.add('visible');
        }, 10); // A small delay of 10ms is enough to trigger the fade-in
    }, 1000); // 1000ms = 1 second, matching the CSS transition duration for the video fade-out
}

// Function to skip the video and go straight to the main content
function skipVideo() {
    // Ensure both video and main content are handled to prevent black screens
    introVideoContainer.classList.add('hidden');
    mainContentContainer.classList.remove('hidden');
    
    // Set the main content's opacity to 1 immediately as we are skipping the animation
    landingContentWrapper.classList.add('visible');
}

document.addEventListener('DOMContentLoaded', () => {
    // Check if the video has already been played in this session
    if (sessionStorage.getItem('hasPlayedIntro')) {
        skipVideo();
    } else {
        // If not, play the video and listen for its 'ended' event
        if (introVideo) {
            // Unhide the main container so it can fade in later
            mainContentContainer.classList.remove('hidden');
            
            // Set the video to be visible and start playing
            introVideo.style.display = 'block';
            introVideo.play();
            
            introVideo.addEventListener('ended', transitionToMainContent);
        } else {
            // Fallback if video element is not found, just show the content
            skipVideo();
        }
    }
});