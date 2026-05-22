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


UPLOAD_FOLDER = 'uploads/spot_images/'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure the upload folder exists
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


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
    cursor.execute("SELECT id, nickname, description, profile_pic FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if user:
        return jsonify({
            "user_id": user["id"],
            "nickname": user["nickname"],
            "description": user["description"],
            "profile_pic": user["profile_pic"]
        }), 200
    else:
        return jsonify({"error": "User not found"}), 404


def get_user_info_by_email(email):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.commit()
    return user

def get_user_info_by_id(user_id):
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.commit()
    return user

@app.route('/api/check_user', methods=['POST'])
def check_user():
    data = request.json
    nickname = data.get('nickname')
    email = data.get('email')

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
            "user_id": user["id"],
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
    # print(data)
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
    user = get_user_info_by_email(email)
    return jsonify({"message": "User created succesfully ", "user": user}), 200 


def save_base64_image(base64_image, spot_id, index):
    # Extract image type and base64 data
    header, base64_data = base64_image.split(';base64,')
    image_extension = header.split('/')[-1]  # Example: 'jpeg', 'png'

    # Generate a unique file name using spot_id and image index
    image_filename = f'spot_{spot_id}_{index}.{image_extension}'
    image_path = os.path.join(app.config['UPLOAD_FOLDER'], image_filename)

    # Decode base64 data
    with open(image_path, 'wb') as f:
        f.write(base64.b64decode(base64_data))

    return image_path


@app.route('/api/spots', methods=['GET'])
def get_spots():
    db = get_db()
    cursor = db.cursor()
    # Fetch all spots
    cursor.execute("SELECT * FROM spots")
    spots = cursor.fetchall()
    
    spots_list = []
    
    for spot in spots:
        cursor.execute("SELECT file_path FROM spot_images WHERE spot_id = ?", (spot["id"],))
        images = cursor.fetchall()
        cursor.execute("SELECT nickname FROM users WHERE id = ?", (spot["user_id"],))
        nickName_result = cursor.fetchone()
        nickName = nickName_result[0] if nickName_result else "Unknown"
        # Convert image files to Base64 and store them in a list
        base64_images = []
        for image in images:
            image_path = image["file_path"]
            try:
                with open(image_path, "rb") as image_file:
                    # Read the image file and encode it in base64
                    encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
                    # Prepend the appropriate data URL prefix
                    mime_type = image_path.split('.')[-1]  # Extract file extension
                    base64_image = f"data:image/{mime_type};base64,{encoded_image}"
                    base64_images.append(base64_image)
            except FileNotFoundError:
                print(f"Image file {image_path} not found.")



        spots_list.append({ 
            "Id": spot["id"],
            "Name": spot["name"],
            "Description": spot["description"],
            "Geolocation": spot["geolocation"],
            "user_id": spot["user_id"],
            "Time": spot["timestamp"],
            "Images": base64_images 
        })
    return jsonify(spots_list)

@app.route('/api/spots', methods=['POST'])
def add_spot():
    data = request.json
    name = data.get('spotName')
    description = data.get('Description')
    geolocation = f"{data['Geolocation']['lat']},{data['Geolocation']['lng']}"
    email = data.get('userEmail')
    user = get_user_info_by_email(email)
    user_id = user["id"]
    images = data.get('images')
    timestamp = datetime.now().isoformat()

    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO spots (Name, Description, Geolocation, user_id, timestamp) VALUES (?, ?, ?, ?, ?)",
                   (name, description, geolocation, user_id, timestamp))
    spot_id = cursor.lastrowid
    db.commit()

    image_paths = []
    for index, base64_image in enumerate(images):
        image_path = save_base64_image(base64_image, spot_id, index)
        image_paths.append(image_path)
        cursor.execute('INSERT INTO spot_images (spot_id, file_path) VALUES (?, ?)', (spot_id, image_path))

    db.commit()

    return jsonify({'message': 'Spot added successfully!'}), 201


@app.route('/api/spots/<int:spot_id>', methods=['PUT'])
def update_spot(spot_id):
    data = request.json
    name = data.get('spotName')
    description = data.get('Description')
    geolocation = f"{data['Geolocation']['lat']},{data['Geolocation']['lng']}" if data.get('Geolocation') else None
    userEmail = data.get('userEmail')
    images = data.get('images')  # Assuming images are optional
    timestamp = datetime.now().isoformat()

    db = get_db()
    cursor = db.cursor()

    # Update the main spot fields
    cursor.execute("""
        UPDATE spots
        SET Name = ?, Description = ?, Geolocation = ?, userEmail = ?, timestamp = ?
        WHERE id = ?
    """, (name, description, geolocation, userEmail, timestamp, spot_id))

    # Handle images update if new images are provided
    if images:
        # Optional: Remove old images if replacing them entirely
        cursor.execute("DELETE FROM spot_images WHERE spot_id = ?", (spot_id,))
        db.commit()
        
        # Save each new image and add it to the database
        for index, base64_image in enumerate(images):
            image_path = save_base64_image(base64_image, spot_id, index)
            cursor.execute('INSERT INTO spot_images (spot_id, file_path) VALUES (?, ?)', (spot_id, image_path))

    db.commit()

    return jsonify({'message': 'Spot updated successfully!'}), 200

@app.route('/api/spots/<int:spot_id>/like', methods=['POST'])
def like_spot(spot_id):
    db = get_db()
    cursor = db.cursor()

    # Check if the spot exists
    cursor.execute("SELECT * FROM spots WHERE id = ?", (spot_id,))
    spot = cursor.fetchone()

    if spot is None:
        return jsonify({"error": "Spot not found"}), 404

    # Increment the number of likes
    new_likes = spot['likes'] + 1
    cursor.execute("UPDATE spots SET likes = ? WHERE id = ?", (new_likes, spot_id))
    db.commit()

    return jsonify({"message": "Spot liked", "likes": new_likes}), 200

@app.route('/api/spots/<int:spot_id>/comment', methods=['POST'])
def add_comment(spot_id):
    db = get_db()
    cursor = db.cursor()

    data = request.json
    userEmail = data.get('userEmail')
    user = get_user_info_by_email(userEmail)
    user_id = user["id"]
    comment = data.get('comment')
    timestamp = data.get('timestamp')

    # Check if the spot exists
    cursor.execute("SELECT * FROM spots WHERE id = ?", (spot_id,))
    spot = cursor.fetchone()

    if spot is None:
        return jsonify({"error": "Spot not found"}), 404

    # Insert the new comment into the comments table
    cursor.execute(
        "INSERT INTO comments (spot_id, user_id, comment, timestamp) VALUES (?, ?, ?, ?)",
        (spot_id, user_id, comment, timestamp)
    )
    db.commit()

    return jsonify({"message": "Comment added successfully"}), 201

@app.route('/api/spots/<int:spot_id>/comments', methods=['GET'])
def get_comments(spot_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM comments WHERE spot_id = ? ORDER BY timestamp ASC", (spot_id,))
    comments = cursor.fetchall()

    comments_list = []
    for comment in comments:
        user_id = comment["user_id"]
        user = get_user_info_by_id(user_id)
        comment_data = {
            "id": comment["id"],
            "userName": user["nickname"],
            "userEmail": user["email"],
            "comment": comment["comment"],
            "timestamp": comment["timestamp"]
        }
        comments_list.append(comment_data)

    return jsonify(comments_list)

@app.route('/api/spots/<int:comment_id>/comment', methods=['DELETE'])
def delete_comment(comment_id):
    conn = get_db()
    cursor = conn.cursor()
    
    cursor.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
    conn.commit()
    
    if cursor.rowcount > 0:
        return jsonify({"message": "Comment deleted successfully"}), 200
    else:
        return jsonify({"error": "Comment not found"}), 404


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
                # print("encoded data:")
                # print(encoded_string)
                return jsonify({"profile_pic": f"data:image/png;base64,{encoded_string}"}), 200
        else:
            return jsonify({"error": "Default image not found"}), 500

@app.route('/api/spots/<int:spot_id>', methods=['DELETE'])
def delete_spot(spot_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT file_path FROM spot_images WHERE spot_id = ?", (spot_id,))
    images = cursor.fetchall()

    cursor.execute("DELETE FROM comments WHERE spot_id = ?", (spot_id, ))
    db.commit()

    cursor.execute("DELETE FROM spots WHERE id = ?", (spot_id,))
    db.commit()

    for image in images:
        file_path = image['file_path']
        if os.path.exists(file_path):
            os.remove(file_path)  # Remove the file from the file system

    return jsonify({"message": "Spot and associated images deleted successfully."}), 200

@app.route('/api/delete_user/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if user:
        user_id = user['id']

        # Reassign related records to the "deleted" user
        cursor.execute("UPDATE spots SET user_id = 0 WHERE user_id = ?", (user_id,))
        cursor.execute("UPDATE comments SET user_id = 0 WHERE user_id = ?", (user_id,))
        db.commit()

        # Now delete the user
        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        db.commit()

        return jsonify({"message": "User deleted successfully; related records reassigned to 'deleted' user"}), 200
    else:
        return jsonify({"error": "User not found"}), 404

@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=5000)

