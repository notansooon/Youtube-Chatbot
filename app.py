from flask import Flask, request, jsonify
from youtube_transcript_api import YouTubeTranscriptApi
from answergenerator import generate_response

 
app = Flask(__name__)

def get_answer(question, transcript, sameVideo):
    summary = ''

    if not sameVideo:
        chunk_size = 160000  # Size of each chunk of the transcript
        overlap = 200      # Overlap between chunks to maintain context
        for i in range(0, len(transcript), chunk_size - overlap):
            part = transcript[i:i + chunk_size]
            summary_text = generate_response(part, question, sameVideo)
            summary += summary_text + ' '
    else: 
        summary = generate_response("Same transcript as last response", question, sameVideo)   
    return summary.strip()


@app.route('/get-answer', methods=['POST'])
def get_answer_route():

    data = request.json
    question = data['question']
    transcript = data['transcript']
    sameVideo = data['sameVideo']
    if sameVideo == 'True':
        sameVideo = True
    else:
        sameVideo = False
    
    answer = get_answer(question, transcript, sameVideo)
    return jsonify(answer=answer), 200

def format_timestamp(seconds):
    """Convert seconds to MM:SS format"""
    minutes = int(seconds // 60)
    seconds = int(seconds % 60)
    return f"{minutes:02}:{seconds:02}"

@app.get('/transcript')
def get_transcript():
    url = request.args.get('url')
    video_id = url.split('=')[1]
    transcript_list = YouTubeTranscriptApi.get_transcript(video_id)
    # Format each transcript entry with start time, duration, and text
    transcript = ' '.join([
        f"[{format_timestamp(d['start'])} - {format_timestamp(d['start'] + d['duration'])}] {d['text']}" 
        for d in transcript_list
    ])
    return transcript, 200

    
if __name__ == '__main__':
    app.run(debug=True)

# rest of your code...






