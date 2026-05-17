from flask import Flask, jsonify, request, send_from_directory, g, url_for, redirect
from authlib.integrations.flask_client import OAuth
from flask_jwt_extended import JWTManager, create_access_token
import sqlite3
from urllib.parse import urlencode
from datetime import datetime
from flask_cors import CORS
import os 
from flask import make_response

DATABASE = "main_db.db"
app = Flask(__name__, static_folder='../Frontend/coolspot/build', template_folder='../Frontend/coolspot/build')
app.secret_key = "2klj53b3ocdy7v928oiuvgvbfv20v8c"
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

# JWT setup
app.config['JWT_SECRET_KEY'] = 'your-jwt-secret'
jwt = JWTManager(app)

person = {"name": None, "email": None}

# OAuth setup
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id="304862924981-o5ghsqptv2e8jjbkvli6cm0rov256ahv.apps.googleusercontent.com",
    client_secret="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",
    authorize_url='https://accounts.google.com/o/oauth2/auth',
    access_token_url='https://accounts.google.com/o/oauth2/token',
    client_kwargs={'scope': 'email profile'},
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration'
)


def get_db():
    # Connect to the SQLite database, creating a new connection if necessary
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.row_factory = sqlite3.Row  # Set the row factory to return dictionaries
    
    return db

@app.after_request
def set_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "unsafe-none"  # Allow cross-origin interaction
    response.headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"  # Allow resources from other origins
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"  # Allow cross-origin resources
    response.headers["Access-Control-Allow-Origin"] = "*"  # Allow any origin to access your API
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"  # Allow specific HTTP methods
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"  # Allow necessary headers
    return response

@app.route('/api/login')
def login():
    redirect_uri = url_for('authorize', _external=True)
    return google.authorize_redirect(redirect_uri)

@app.route('/authorize')
def authorize():
    token = google.authorize_access_token()
    resp = google.get('https://www.googleapis.com/oauth2/v3/userinfo')
    resp.raise_for_status()
    profile = resp.json()

    person['email'] = profile['email']
    person['name'] = profile.get('name', '')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (person['email'] ,))
    user = cursor.fetchone()

    if user:
        print(user['email'])
        conn.close()
        access_token = create_access_token(identity={'email': profile['email']})
    else:
        print("creating user")
        cursor.execute("INSERT INTO users (email, nickname) VALUES (?, ?)", (person['email'] , person['name'] ))
        conn.commit()
        conn.close()
        access_token = create_access_token(identity={'email': profile['email']})
    
    redirect_url = url_for('serve_react_app', _external=True)  # Assuming your main page route is '/'
    params = {'token': access_token}
    
    return redirect(f"{redirect_url}?{urlencode(params)}")  # Redirect to /?token=<jwt_token>


@app.route('/')
def serve_react_app():
    return send_from_directory(app.template_folder, 'index.html')

@app.route('/static/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder + '/static', path)

@app.route('/images/<path:filename>')
def serve_image_files(filename):
    return send_from_directory("../Frontend/coolspot/build" + "/images" , filename)

@app.route('/manifest.json')
def serve_manifest():
    return send_from_directory(app.static_folder, 'manifest.json')

@app.route('/api/update_user_profile', methods=['POST'])
def change():
    data = request.get_json()  # Access the JSON data
    if not data:
        return jsonify({"error": "No data provided"}), 400  # Check if data is present
    
    nickname = data.get("nickname")  # Extract username
    description = data.get("description")  # Extract description
    email = data.get("email")

    conn = get_db()  # Get the database connection
    cursor = conn.cursor()
    print(data)
    print(nickname, description, email)
    # SQL command to update the user's nickname and description based on email
    cursor.execute("""
        UPDATE users
        SET nickname = ?, description = ?
        WHERE email = ?
    """, (nickname, description, email))

    conn.commit()  # Commit the changes to the database
    conn.close()  # Close the connection

    return jsonify({"message": "Profile updated successfully"}), 200  # Return a success response


@app.route('/api/update_profile', methods=['POST'])
def send():
    data = request.get_json() 
    email = data["email"]
    print("succesful sign in yahoo!", data["email"])

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT nickname, description, profile_pic FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if user:
        # Return the user's profile data as JSON
        return jsonify({
            "nickname": user["nickname"],
            "description": user["description"],
            "profile_pic": user["profile_pic"]
        }), 200
    else:
        return jsonify({"error": "User not found"}), 404

    # conn.commit()  # Commit the changes to the database
    # conn.close()  # Close the connection

    # nickname = None
    # description = None
    # picture = None
    # email = None

    # return jsonify({"nickname": nickname, "description": description, "picture": picture, "email": email}), 200  # Return a success response


@app.route('/api/check_user', methods=['POST'])
def check_user():
    data = request.json
    email = data.get('email')
    nickname = data.get('nickname')

    # Check if user exists in the database
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if user:
        # User exists, return user data
        print("exists")
        return jsonify(message="User exists", user={
            "email": user[2],
            "nickname": user[1],
            "description": user[5],
        }), 200
    else:
        print("trying create")
        # User does not exist, create a new user
        cursor.execute("INSERT INTO users (email, nickname) VALUES (?, ?)", (email, nickname))
        conn.commit()
        return jsonify(message="User created", user={
            "email": email,
            "name": nickname
        }), 201  # HTTP status code for Created
    
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
    geolocation = data.get("Geolocation")
    print(data)
    # print(geolocation, description)
    karma = 0  # Or whatever default you want
    user_id = -1  # VAJAGA PEC TAM PIELIKT REALO
    time = datetime.now().isoformat()

    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO spots (Name, Description, Geolocation, 'User id', Karma, Time) VALUES (?, ?, ?, ?, ?, ?)",
                   (name, description, geolocation, user_id, karma, time))
    db.commit()
    return jsonify({'message': 'Spot added successfully!'}), 201



@app.teardown_appcontext
def close_connection(exception):
    # Close the database connection when the context is destroyed
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)


