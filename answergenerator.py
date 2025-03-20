import openai
import os
from dotenv import load_dotenv


load_dotenv()

API_key = os.getenv("API_KEY")



# Set up OpenAI API key
openai.api_key = API_KEY


message_log = []
firstMessage = True

# Function to send a message to the OpenAI chatbot model and return its response
def send_message(message_log):
    # Use OpenAI's ChatCompletion API to get the chatbot's response
    response = openai.ChatCompletion.create(
        model="gpt-4-turbo",  # The name of the OpenAI chatbot model to use
        messages=message_log,   # The conversation history up to this point, as a list of dictionaries
        max_tokens=50,        # The maximum number of tokens (words or subwords) in the generated response
        stop=None,              # The stopping sequence for the generated response, if any (not used here)
        temperature= 0.5,        # The "creativity" of the generated response (higher temperature = more creative)
        top_p=0.8,             # Top-p sampling for coherence and relevance

    )
    # If no response with text is found, return the first response's content (which may be empty)
    return response.choices[0].message.content



#function to send specfic message
def generate_response(transcript, question, sameVideo):
    global message_log  # Declare that we're using the global message_log variable

    if not sameVideo:
        message_log = [
            {"role": "system", "content": "You are part of a chatbox that answers questions about the following transcript with timestamps. Answer questions concisely in no more than two sentences."},
            {"role": "user", "content": f"This transcript is of one youtube video. It includes timestamps for each line: {transcript}\nAnswer the following question as specified: {question}"}
        ]
    else: 
        message_log.append({"role": "user", "content": f"Answer the following question concisely as specified based on the previous transcript:{question}"})
    
    response = send_message(message_log)

    return response


