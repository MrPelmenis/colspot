from flask import Flask, jsonify, request, send_from_directory, g
from flask_cors import CORS
import sqlite3
from datetime import datetime

app = Flask(__name__, static_folder='../Frontend/coolspot/build', template_folder='../Frontend/coolspot/build')
CORS(app)  # Enables Cross-Origin Resource Sharing to allow requests from different ports (e.g., React on port 3000)
DATABASE = "main_db.db"

def get_db():
    # Connect to the SQLite database, creating a new connection if necessary
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # Set the row factory to return dictionaries
    
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

@app.route('/api/spots', methods=['GET'])
def get_spots():
    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM spots")
    spots = cursor.fetchall()
    spots_list = [{ 
        "Id": spot["Id"],
        "Name": spot["Name"],
        "Description": spot["Description"],
        "Geolocation": spot["Geolocation"],
        "User id": spot["User id"],
        "Karma": spot["Karma"],
        "Time": spot["Time"]
    } for spot in spots]

    return jsonify(spots_list)

@app.route('/api/spots', methods=['POST'])
def add_spot():
    data = request.json
    name = data.get('Name')
    description = data.get('Description')
    geolocation = f"{data.get('lat')},{data.get('lng')}"
    karma = 0  # Or whatever default you want
    user_id = 666  # VAJAGA PEC TAM PIELIKT REALO
    time = datetime.now().isoformat()

    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO spots (Name, Description, Geolocation, 'User id', Karma, Time) VALUES (?, ?, ?, ?, ?, ?)",
                   (name, description, geolocation, user_id, karma, time))
    db.commit()
    return jsonify({'message': 'Spot added successfully!'}), 201

if __name__ == '__main__':
    app.run(debug=True)
