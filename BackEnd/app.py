from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables Cross-Origin Resource Sharing to allow requests from different ports (e.g., React on port 3000)

@app.route('/api/data', methods=['GET'])
def get_data():
    return jsonify({
        'message': 'Hello from Flask',
        'data': [1, 2, 3, 4]
    })

@app.route('/api/post-data', methods=['POST'])
def post_data():
    received_data = request.json
    return jsonify({
        'message': 'Data received',
        'data': received_data
    })

if __name__ == '__main__':
    app.run(debug=True)
