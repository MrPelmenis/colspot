from flask import Flask, jsonify, request, send_from_directory, g
from flask_cors import CORS
import sqlite3

app = Flask(__name__, static_folder='../Frontend/coolspot/build', template_folder='../Frontend/coolspot/build')
CORS(app)  # Enables Cross-Origin Resource Sharing to allow requests from different ports (e.g., React on port 3000)
DATABASE = "main_db.db"

def get_db():
    # Connect to the SQLite database, creating a new connection if necessary
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
    return db

@app.teardown_appcontext
def close_connection(exception):
    # Close the database connection when the context is destroyed
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()


@app.route('/')
def serve_react_app():
    return send_from_directory(app.template_folder, 'index.html')

@app.route('/static/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder + '/static', path)


# Example route to fetch data from the SQLite database
@app.route('/api/users')
def get_users():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, name, email FROM users")
    users = cursor.fetchall()

    # Convert the result to a list of dictionaries for JSON response
    users_list = [{'id': row[0], 'name': row[1], 'email': row[2]} for row in users]

    return jsonify(users_list) 

if __name__ == '__main__':
    app.run(debug=True)
