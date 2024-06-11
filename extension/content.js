// Function to initialize the chatbox
const init = function() {
    console.log("Initializing chatbox...");

    // Create the chatbox container
    const injectElement = document.createElement('div');
    injectElement.className = "chatbox minimized"; // Start with minimized state

    // Add the inner HTML for the chatbox
    injectElement.innerHTML = `
        <div class="chatbox-header" id="chatbox-header">
            Q&A for YouTube
            <button id="toggle-button" type="button">Expand</button>
        </div>
        <div class="chatbox-messages" id="chatbox-messages" style="display: none;">
            <!-- Messages will appear here -->
        </div>
        <div class="chatbox-input" id="chatbox-input" style="display: none;">
            <input type="text" id="chat-input" placeholder="Type your question here..." />
            <button id="send-button" type="button">Send</button>
        </div>
    `;

    // Append the chatbox to the body
    document.body.appendChild(injectElement);

    const sendMessage = () => {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        console.log("Message to send:", message);
        if (message !== "") {
            const messageElement = document.createElement('p');
            messageElement.className = "sent";
            messageElement.textContent = message;
            document.getElementById('chatbox-messages').appendChild(messageElement);
            input.value = "";

            // Smooth scroll to bottom
            messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });

            // Change the send button color and disable it
            const sendButton = document.getElementById('send-button');
            sendButton.style.backgroundColor = '#ff7f7f'; // Lighter shade of red
            sendButton.disabled = true;

            // Send message to background script
            chrome.runtime.sendMessage({ type: 'newMessage', message: message }, function(response) {
                console.log("Response from background script:", response);
                appendResponse(response.answer);

                // Reset the send button color and enable it
                sendButton.style.backgroundColor = '#007aff';
                sendButton.disabled = false;
            });
        }
    };

    // Add event listener for the send button
    document.getElementById('send-button').addEventListener('click', sendMessage);

    // Add event listener for the enter key
    document.getElementById('chat-input').addEventListener('keypress', function(event) {
        if (event.key === 'Enter') {
            sendMessage();
        }
    });

    // Add event listener for the toggle button
    document.getElementById('toggle-button').addEventListener('click', function() {
        const chatbox = document.querySelector('.chatbox');
        chatbox.classList.toggle('minimized');
        const messages = document.getElementById('chatbox-messages');
        const input = document.getElementById('chatbox-input');
        const toggleButton = document.getElementById('toggle-button');
        
        if (chatbox.classList.contains('minimized')) {
            messages.style.display = 'none';
            input.style.display = 'none';
            toggleButton.textContent = 'Expand';
        } else {
            messages.style.display = 'flex';
            input.style.display = 'flex';
            toggleButton.textContent = 'Collapse';
        }
    });

    // Add draggable functionality
    const chatboxHeader = document.getElementById('chatbox-header');
    let isDragging = false;
    let offsetX, offsetY;

    chatboxHeader.addEventListener('mousedown', function(event) {
        isDragging = true;
        offsetX = event.clientX - injectElement.getBoundingClientRect().left;
        offsetY = event.clientY - injectElement.getBoundingClientRect().top;
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    });

    const onMouseMove = function(event) {
        if (isDragging) {
            injectElement.style.left = `${event.clientX - offsetX}px`;
            injectElement.style.top = `${event.clientY - offsetY}px`;
            injectElement.style.right = 'auto'; // Ensure right position is reset to auto when dragging
            injectElement.style.bottom = 'auto'; // Ensure bottom position is reset to auto when dragging
        }
    };

    const onMouseUp = function() {
        isDragging = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };

    // Function to check if the page is in full-screen mode
    const isFullScreen = () => {
        return document.fullscreenElement ||
               document.webkitFullscreenElement ||
               document.mozFullScreenElement ||
               document.msFullscreenElement;
    };

    // Function to handle full-screen changes
    const handleFullScreenChange = () => {
        const chatbox = document.querySelector('.chatbox');
        if (isFullScreen()) {
            chatbox.style.display = 'none';
        } else {
            chatbox.style.display = 'flex';
        }
    };

    // Add event listeners for full-screen changes
    document.addEventListener('fullscreenchange', handleFullScreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullScreenChange);
    document.addEventListener('mozfullscreenchange', handleFullScreenChange);
    document.addEventListener('msfullscreenchange', handleFullScreenChange);

    // Initial check in case the page is already in full-screen mode
    handleFullScreenChange();
}

// Listen for messages from background script
function appendResponse(res) {
    const messageElement = document.createElement('p');
    messageElement.className = "received";
    messageElement.textContent = res;
    document.getElementById('chatbox-messages').appendChild(messageElement);

    // Smooth scroll to bottom
    messageElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// Run init function when the DOM is fully loaded
init();
