from flask import Flask, jsonify, request, send_from_directory, g, url_for, redirect
from authlib.integrations.flask_client import OAuth
import sqlite3
from datetime import datetime
from flask_cors import CORS

import os
import base64

DATABASE = "main_db.db"
app = Flask(__name__, static_folder='../Frontend/coolspot/build')
app.secret_key = "2klj53b3ocdy7v928oiuvgvbfv20v8c"
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

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

@app.route('/')
def serve_react_app():
    return send_from_directory(app.static_folder, 'index.html')

@app.route('/static/<path:path>')
def serve_static_files(path):
    return send_from_directory(app.static_folder + '/static', path)

@app.route('/images/<path:filename>')
def serve_image_files(filename):
    return send_from_directory("../Frontend/coolspot/build" + "/images" , filename)

@app.route('/manifest.json')
def serve_manifest():
    return send_from_directory(app.static_folder, 'manifest.json')

@app.route('/config.js')
def serve_config():
    return send_from_directory(app.static_folder, 'config.js')


@app.route('/api/update_user_profile', methods=['POST'])
def change():
    data = request.get_json()  
    if not data:
        return jsonify({"error": "No data provided"}), 400  
    
    nickname = data.get("nickname") 
    description = data.get("description")  
    email = data.get("email")
    profile_pic = data.get("profile_pic")

    conn = get_db()  
    cursor = conn.cursor()
    cursor.execute("SELECT nickname, description, profile_pic FROM users WHERE email = ?", (email,))
    userdb = cursor.fetchone()
    nicknamedb = userdb["nickname"]

    if nicknamedb != nickname:
        cursor.execute("SELECT 1 FROM users WHERE nickname = ?", (nickname,))
        existing_user = cursor.fetchone()

        if existing_user:
            print("took")
            return jsonify({"message": "took"}), 200     

    cursor.execute("""
        UPDATE users
        SET nickname = ?, description = ?, profile_pic = ?
        WHERE email = ?
    """, (nickname, description, profile_pic, email))

    conn.commit()  

    return jsonify({"message": "Profile updated successfully"}), 200  


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
        return jsonify({
            "nickname": user["nickname"],
            "description": user["description"],
            "profile_pic": user["profile_pic"]
        }), 200
    else:
        return jsonify({"error": "User not found"}), 404


@app.route('/api/check_user', methods=['POST'])
def check_user():
    data = request.json
    email = data.get('email')
    nickname = data.get('nickname')

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.commit()

    if user:
        print("exists")
        return jsonify(message="User exists", user={
            "email": user["email"],
            "nickname": user["nickname"],
            "description": user["description"],
            "profile_pic": user["profile_pic"],
        }), 200
    else: # UZTAISIT ATSEVISKO FUNKCIJU LAI LAI UZTAISAS AKKAUNTS
        # print("trying create")
        # # User does not exist, create a new user
        # cursor.execute("INSERT INTO users (email, nickname) VALUES (?, ?)", (email, nickname))
        return jsonify(message="User created", user={
            "email": email,
            "name": nickname
        }), 201  # HTTP status code for Created
    
@app.route('/api/create_user', methods=["POST"])
def create_user():
    data = request.json
    print(data)
    email = data.get('email')
    nickname = data.get('nickname')

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT 1 FROM users WHERE nickname = ?", (nickname,))
    existing_user = cursor.fetchone()

    if existing_user:
        print("took")
        return jsonify({"message": "took"}), 200  


    cursor.execute("INSERT INTO users (email, nickname) VALUES (?, ?)", (email, nickname))
    conn.commit()

    return jsonify({"message": "User created succesfully "}), 200 


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
    print(data)
    name = data.get('Name')
    description = data.get('Description')
    geolocation = data.get("Geolocation")
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





@app.route('/api/get_profile_image', methods=['GET'])
def get_profile_image():
    nickname = request.args.get('nickname') 

    if not nickname:
        return jsonify({"error": "Nickname is required"}), 400

    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT profile_pic FROM users WHERE nickname = ?", (nickname,))
    user = cursor.fetchone()

    if user and user[0]:
        return jsonify({"profile_pic": user[0]}), 200 
    else:
        default_image_path = "DefaultProfilePic.png"
        if os.path.exists(default_image_path):
            with open(default_image_path, "rb") as image_file:
                encoded_string = base64.b64encode(image_file.read()).decode('utf-8')
                print("encoded data:")
                print(encoded_string)
                return jsonify({"profile_pic": f"data:image/png;base64,{encoded_string}"}), 200
        else:
            return jsonify({"error": "Default image not found"}), 500



@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)


