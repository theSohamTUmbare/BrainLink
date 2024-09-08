from flask import Flask, request, jsonify
from app import get_pdf_text, get_text_chunks, get_vector_store, user_input

app = Flask(__name__)

@app.route('/process_pdf', methods=['POST'])
def process_pdf():
    pdf_files = request.files.getlist("pdf_files")
    raw_text = get_pdf_text(pdf_files)
    text_chunks = get_text_chunks(raw_text)
    get_vector_store(text_chunks)
    print("Doneserverpy")
    return jsonify({"message": "PDF processed and FAISS index created"}), 200

@app.route('/ask_question', methods=['POST'])
def ask_question():
    user_question = request.json.get("question")
    response = user_input(user_question)
    
    if response is not None and "output_text" in response:
        return jsonify({"response": response["output_text"]}), 200
    else:
        return jsonify({"response": "An error occurred while processing the question."}), 500


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
