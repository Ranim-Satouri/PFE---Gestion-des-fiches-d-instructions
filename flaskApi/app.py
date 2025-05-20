from flask import Flask, request, jsonify
import os
import re
import unicodedata
import pdfplumber
import string
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import spacy
import requests
from flask_cors import CORS

app = Flask(__name__)

CORS(app, resources={r"/*": {"origins": "*", "methods": ["GET", "POST"], "allow_headers": ["Content-Type"], "supports_credentials": True}})

GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions'

API_KEY = "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"

nlp_fr = spacy.load('fr_core_news_sm')

def read_pdf(file_path):
    try:
        with pdfplumber.open(file_path) as pdf:
            text_content = []
            for page in pdf.pages:
                text_content.append(page.extract_text())
            # Clean the extracted text
            return ' '.join(text_content)
    except Exception as e:
        raise Exception(f"Error reading PDF file: {str(e)}")


def clean_text(text, preserve_numbers=False):
    """
    Clean the text by normalizing, tokenizing, removing stopwords, and lemmatizing using spaCy French model.
    """
    # Normalize text: lowercase, trim and remove non-ASCII characters
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('utf-8', 'ignore')
    text = text.lower().strip()

    # Remove URLs
    text = re.sub(r'http\S+|www\.\S+', '', text)

    # Remove digits unless preserving them
    if not preserve_numbers:
        text = re.sub(r'\d+', '', text)

    # Define punctuation to preserve
    preserve_punct = ['-', "'"]
    allowed_punctuation = set(string.punctuation) - set(preserve_punct)

    # Remove punctuation except preserved ones
    text = ''.join(char for char in text if char not in allowed_punctuation)

    # Use spaCy French model for tokenization, stopwords removal, and lemmatization
    doc = nlp_fr(text)
    words = [token.lemma_ for token in doc if not token.is_stop and token.is_alpha]

    cleaned_text = ' '.join(words)
    return cleaned_text

def calculate_similarity(search_query, fiche_text):
    try:
        # Check if the search query contains digits
        preserve_numbers = any(char.isdigit() for char in search_query)  # Preserve digits if the query contains digits

        # Clean the extracted text
        cleaned_fiche_text = clean_text(fiche_text, preserve_numbers=preserve_numbers)

        # Clean the search query and CV text based on whether to preserve numbers
        cleaned_search_query = clean_text(search_query, preserve_numbers=preserve_numbers)

        texts = [cleaned_search_query, cleaned_fiche_text]

        # Compute TF-IDF vectors
        vectorizer = TfidfVectorizer(ngram_range=(1, 3))
        tfidf_matrix = vectorizer.fit_transform(texts)

        # Calculate cosine similarity
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2]).flatten()[0]

        return float(similarity)
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.route('/calculate-similarities', methods=['POST'])
def calculate_similarities_route():
    try:
        data = request.get_json(force=True)
        fiches = data.get('fiches')
        reference_text = data.get('text')

        # Input validation
        if not isinstance(fiches, list):
            return jsonify({'error': '"fiches" must be a list.'}), 400
        if not isinstance(reference_text, str) or not reference_text.strip():
            return jsonify({'error': '"text" must be a non-empty string.'}), 400

        base_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'fiches')
        results = []

        for fiche in fiches:
            fiche_id = fiche.get('id')
            filename = fiche.get('filename')

            if not fiche_id or not filename:
                print(f"Invalid fiche entry: {fiche}")
                continue  

            filepath = os.path.join(base_dir, filename)
            if not os.path.isfile(filepath):
                print(f"File not found: {filepath}")
                continue 

            try:
                pdf_text = read_pdf(filepath)
                score = calculate_similarity(reference_text, pdf_text)
                #if score > 0:
                results.append({"id": fiche_id, "score": float(score)})
            except Exception as e:
                # Log the error if needed: print(f"Error processing {filename}: {e}")
                print(e)
                continue

        # Sort candidates by similarity score in descending order
        sorted_results = sorted(results, key=lambda x: x['score'], reverse=True)
        return jsonify(sorted_results), 200

    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

###############################################################################

@app.route('/fix-text', methods=['POST'])
def handle_post():
    try:
        print(API_KEY)
        body = request.get_json()

        request_body = {
            "model": "llama3-8b-8192",
            "messages": [
                {
                    "role": "system",
                    "content": (
                        "You are an AI assistant that corrects texts by fixing grammar, structure, and clarity. "
                        "Don't change anything other than correcting the text. "
                        "If the text is already correct, return it as is. "
                        "Only return the corrected text without any extra commentary or explanations. If the input is "
                        "\"Helllo\", the response should be \"Hello\". For example:\n\n"
                        "\"I can has cheeseburger\" -> \"I can have a cheeseburger.\"\n"
                        "\"Their going to the store.\" -> \"They're going to the store.\"\n"
                        "\"She dont know the answer.\" -> \"She doesn't know the answer.\"\n"
                        "\"I will meet you at the park 5:00.\" -> \"I will meet you at the park at 5:00.\""
                    )
                },
                {
                    "role": "user",
                    "content": body.get("prompt")
                }
            ]
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }

        response = requests.post(GROQ_API_URL, json=request_body, headers=headers)
        response.raise_for_status()
        data = response.json()

        assistant_response = data.get('choices', [{}])[0].get('message', {}).get('content', "No response from assistant.")

        return jsonify({"response": assistant_response}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to fetch Groq API response"}), 500

###############################################################################

@app.route('/process-prompt', methods=['POST'])
def ask_groq():
    try:
        body = request.get_json()
        prompt = body.get('prompt')

        if not prompt:
            return jsonify({'error': 'Prompt is required'}), 400

        request_body = {
            "model": "llama3-8b-8192",
            "messages": [
                {
                    "role": "system",
                    "content": prompt
                }
            ]
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {API_KEY}"
        }

        response = requests.post(GROQ_API_URL, json=request_body, headers=headers)
        response.raise_for_status()
        data = response.json()

        assistant_response = data.get('choices', [{}])[0].get('message', {}).get('content', "No response from assistant.")

        return jsonify({"response": assistant_response}), 200

    except Exception as e:
        print("Error:", e)
        return jsonify({"error": "Failed to fetch Groq API response"}), 500

if __name__ == '__main__':
    app.run(debug=True)