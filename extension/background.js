

require('dotenv').config();
// Add a listener for messages received by the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    console.log("Received message in background script:", request);

    // Check if the message type is 'newMessage'
    if (request.type === 'newMessage') {
        // Query for the active tab in the current window
        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
            // Check if any active tabs were found
            if (tabs.length === 0) {
                console.error("No active tabs found");
                sendResponse({ error: "No active tabs found" });
                return;
            }

            // Get the URL of the current tab and the question from the request
            const url = tabs[0].url;
            const question = request.message;
            console.log("Current tab URL:", url);

            // Function to fetch the transcript from a given URL
            const fetchTranscript = async (url) => {
                try {
                    const response = await fetch(`http://127.0.0.1:5000/transcript?url=${url}`);
                    if (!response.ok) {
                        throw new Error('Failed to fetch transcript');
                    }
                    return await response.text();
                } catch (error) {
                    console.error('Error fetching transcript:', error);
                    return 'Error fetching transcript';
                }
            };

            // Function to get an answer to a question based on the transcript
            const getAnswer = async (question, transcript) => {
                try {
                    const response = await fetch('http://127.0.0.1:5000/get-answer', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ question, transcript, sameVideo: "False" })
                    });
                    if (!response.ok) {
                        throw new Error('Failed to get answer');
                    }
                    const data = await response.json();
                    return data.answer;
                } catch (error) {
                    console.error('Error getting answer:', error);
                    return 'Error getting answer';
                }
            };

            // Handle the request by fetching the transcript and getting the answer
            try {
                const transcript = await fetchTranscript(url);
                const answer = await getAnswer(question, transcript);
                sendResponse({ answer });
            } catch (error) {
                console.error('Error handling request:', error);
                sendResponse({ error: 'Error handling request' });
            }
        });

        // Return true to indicate that the response will be sent asynchronously
        return true;
    }
});


