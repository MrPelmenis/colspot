from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

app = Flask(__name__, static_folder='../Frontend/coolspot/build', template_folder='../Frontend/coolspot/build')
CORS(app)  # Enables Cross-Origin Resource Sharing to allow requests from different ports (e.g., React on port 3000)


@app.route('/')
def serve_react_app():
    return send_from_directory(app.template_folder, 'index.html')

@app.route('/static/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder + '/static', path)

# @app.route('/api/data', methods=['GET'])
# def get_data():
#     return jsonify({
#         'message': 'Hello from Flask',
#         'data': [1, 2, 3, 4]
#     })

# @app.route('/api/post-data', methods=['POST'])
# def post_data():
#     received_data = request.json
#     return jsonify({
#         'message': 'Data received',
#         'data': received_data
#     })

if __name__ == '__main__':
    app.run(debug=True)
