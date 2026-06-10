from flask import Flask, jsonify, request, send_from_directory, g, url_for, redirect
from authlib.integrations.flask_client import OAuth
import sqlite3
from datetime import datetime
from flask_cors import CORS
# from flask_jwt_extended import JWTManager, jwt_required, get_jwt_identity
from google.oauth2 import id_token
from google.auth.transport import requests
from functools import wraps

from datetime import datetime, timezone

from werkzeug.utils import secure_filename

#CLIENT_ID = ''

import os
import base64

DATABASE = "main_db.db"
UPLOAD_FOLDER = 'uploads/spot_images/'
app = Flask(__name__, static_folder='../FrontEnd/coolspot/build')
# app.config['SECRET_KEY'] = 'your_strong_secret_key'
# app.config["JWT_SECRET_KEY"] = 'your_jwt_secret_key'
# app.config['JWT_TOKEN_LOCATION'] = ['headers']
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)

os.makedirs(UPLOAD_FOLDER, exist_ok=True)


def google_oauth_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            print("Missing Authorization Header")
            return jsonify({"message": "Missing Authorization Header"}), 401

        token = auth_header.split("Bearer ")[-1]
        # print(token)
        try:
            # Verify the ID token with Google
            id_info = id_token.verify_oauth2_token(token, requests.Request(), CLIENT_ID)
            # Store the user info in g or a session
            request.user = id_info
        except ValueError:
            # Invalid token
            print("Invalid token")
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)

    return decorated_function



def get_db():
    db = getattr(g, '_database', None)
    if db is None:
        db = g._database = sqlite3.connect(DATABASE)
        db.execute('PRAGMA foreign_keys = ON')
        db.row_factory = sqlite3.Row  
    
    return db

@app.after_request
def set_headers(response):
    response.headers["Cross-Origin-Opener-Policy"] = "unsafe-none"  
    response.headers["Cross-Origin-Embedder-Policy"] = "unsafe-none"  
    response.headers["Cross-Origin-Resource-Policy"] = "cross-origin"
    response.headers["Access-Control-Allow-Origin"] = "*"  
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS, PATCH"  
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"  
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

#USER
@app.route('/api/users', methods=["POST"])
@google_oauth_required
def create_user():
    data = request.json
    email = data.get('email').strip()
    nickname = data.get('nickname').strip()

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
    return jsonify({"message": "User created succesfully "}), 200 
    # return jsonify({"message": "User created succesfully ", "user": user}), 200 

@app.route('/api/users', methods=['PATCH'])
@google_oauth_required
def change():
    data = request.get_json()  
    if not data:
        return jsonify({"error": "No data provided"}), 400  
    
    nickname = data.get("nickname").strip()
    description = data.get("description")  
    email = data.get("email").strip()
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
@google_oauth_required
def send():
    data = request.get_json() 
    email = data["email"]
    print("succesful sign in yahoo!", data["email"])

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()

    if user:
        return jsonify({
            "user_id": user["id"],
            "nickname": user["nickname"],
            "description": user["description"],
            "profile_pic": user["profile_pic"],
            "is_admin": user["is_admin"],   

        }), 200
    else:
        return jsonify({"error": "User not found"}), 404

@app.route('/api/check_user', methods=['POST'])
def check_user():
    data = request.json
    nickname = data.get('nickname').strip()
    email = data.get('email').strip()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    conn.commit()

    if user:
        return jsonify(message="User exists", user={
            "email": user["email"],
            "nickname": user["nickname"],
            "description": user["description"],
            "profile_pic": user["profile_pic"],
            "user_id": user["id"],
            "is_admin": user["is_admin"]
        }), 200
    else: # UZTAISIT ATSEVISKO FUNKCIJU LAI LAI UZTAISAS AKKAUNTS
        return jsonify(message="User created", user={
            "email": email,
            "name": nickname
        }), 201  

@app.route('/api/check_user_by_nickname', methods=['POST'])
def check_user_by_nickname():
    data = request.json
    nickname = data.get('nickname').strip()

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE nickname = ?", (nickname,))
    user = cursor.fetchone()
    conn.commit()

    if user:
        return jsonify(message="User exists", user={
            "email": user["email"],
            "nickname": user["nickname"],
            "description": user["description"],
            "profile_pic": user["profile_pic"],
            "user_id": user["id"],
            "is_admin": user["is_admin"]
        }), 200
    else: 
        return jsonify(message="User wit such nickname doesn't exist"), 201  

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

def save_base64_comment_image(base64_image, comment_id):
    header, base64_data = base64_image.split(';base64,')
    image_extension = header.split('/')[-1]  # Example: 'jpeg', 'png'

    comment_upload_folder = os.path.join(app.config['UPLOAD_FOLDER'], "comments")
    if not os.path.exists(comment_upload_folder):
        os.makedirs(comment_upload_folder)

    image_filename = f'comment_{comment_id}_.{image_extension}'
    image_path = os.path.join(comment_upload_folder, secure_filename(image_filename))

    with open(image_path, 'wb') as f:
        f.write(base64.b64decode(base64_data))

    return image_path



@app.route('/api/get_profile_image', methods=['GET'])
def get_profile_image():
    nickname = request.args.get('nickname').strip()
    if not nickname:
        return jsonify({"error": "Nickname is required"}), 400

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users WHERE nickname = ?", (nickname,))
    user = cursor.fetchone()
    conn.commit()

    cursor.execute("SELECT * FROM users WHERE nickname = 'Maximilian '")
    answer = cursor.fetchone()
    if user:
        return jsonify({"profile_pic": user["profile_pic"]}), 200 
    else:
        return jsonify({"error": "Default image not found"}), 500

@app.route('/api/users/top-posters', methods=["GET"])
def get_top_posters():
    db = get_db()
    cursor = db.cursor()

    cursor.execute("""
        SELECT users.id, users.nickname, users.profile_pic, 
        COUNT(spots.id) AS spot_count
        FROM users
        LEFT JOIN spots ON users.id = spots.user_id
        WHERE users.nickname != 'deleted'
        GROUP BY users.id
        ORDER BY spot_count DESC
        LIMIT 10;
    """)
    res = cursor.fetchall()
    
    resp = [{
        "user_id": user[0],
        "nickname": user[1],
        "profile_pic": user[2],
        "spots": user[3]
    } for user in res]
    
    return jsonify(resp), 200
    

@app.route('/api/users/<int:user_id>', methods=['DELETE'])
@google_oauth_required
def delete_user(user_id):

    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if user:
        user_id = user['id']

        cursor.execute("UPDATE spots SET user_id = 0 WHERE user_id = ?", (user_id,))
        cursor.execute("UPDATE comments SET user_id = 0 WHERE user_id = ?", (user_id,))
        db.commit()

        cursor.execute("DELETE FROM users WHERE id = ?", (user_id,))
        db.commit()

        return jsonify({"message": "User deleted successfully; related records reassigned to 'deleted' user"}), 200
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


#insane function that takes in the coordinates in the map + adds filters/order and constructs a massiive query based on it
#+ a lot of post processing (for images categories likes) so that its easier on frontend
@app.route('/api/spots', methods=['GET'])
def get_spots():
    category = request.args.get('category', '').strip()
    sort = request.args.get('sort', '').strip()
    nw_lat = request.args.get('nw_lat')
    nw_lng = request.args.get('nw_lng')
    se_lat = request.args.get('se_lat')
    se_lng = request.args.get('se_lng')

    params = []

    sql = """
    SELECT 
        spots.id,
        spots.name,
        spots.description,
        spots.geolocation,
        spots.user_id,
        users.nickname AS nickname,
        spots.timestamp,
        COUNT(DISTINCT spot_likes.user_id) AS likes_count,
        COUNT(DISTINCT comments.id) AS comments_count,
        GROUP_CONCAT(DISTINCT tags.tag_name) AS categories,
        GROUP_CONCAT(DISTINCT spot_likes.user_id) AS liked_by_user_ids,
        GROUP_CONCAT(DISTINCT spot_images.file_path) AS image_paths
    FROM spots
    LEFT JOIN spot_likes ON spots.id = spot_likes.spot_id
    LEFT JOIN comments ON spots.id = comments.spot_id
    LEFT JOIN users ON spots.user_id = users.id
    LEFT JOIN spot_images ON spots.id = spot_images.spot_id
    """

    if category:
        sql += """
        INNER JOIN spot_tags ON spots.id = spot_tags.spot_id
        INNER JOIN tags ON spot_tags.tag_id = tags.id AND tags.tag_name = ?
        """
        params.append(category)
    else:
        sql += """
        LEFT JOIN spot_tags ON spots.id = spot_tags.spot_id
        LEFT JOIN tags ON spot_tags.tag_id = tags.id
        """

    sql += """
    WHERE 
        (CAST(substr(spots.geolocation, 1, instr(spots.geolocation, ',') - 1) AS REAL) BETWEEN ? AND ?)
        AND 
        (CAST(substr(spots.geolocation, instr(spots.geolocation, ',') + 1) AS REAL) BETWEEN ? AND ?)
    """
    params.extend([se_lat, nw_lat, nw_lng, se_lng])

    sql += "GROUP BY spots.id"

    if sort == 'mostLiked':
        sql += " ORDER BY likes_count DESC"
    elif sort == 'newest':
        sql += " ORDER BY spots.timestamp DESC"
    else:
        sql += " ORDER BY spots.timestamp DESC"  

    sql += " LIMIT 15"

    db = get_db()
    cursor = db.cursor()
    cursor.execute(sql, params)
    spots = cursor.fetchall()

    #add images as base 64 so that the front-end doesnt have to query each one
    spots_list = []
    for row in spots:
        image_paths = row['image_paths'].split(',') if row['image_paths'] else []
        base64_images = []
        for image_path in image_paths:
            try:
                with open(image_path, "rb") as image_file:
                    encoded_image = base64.b64encode(image_file.read()).decode('utf-8')
                    mime_type = image_path.split('.')[-1].lower()
                    if mime_type not in ['jpg', 'jpeg', 'png', 'gif']:
                        mime_type = 'jpeg'  
                    base64_image = f"data:image/{mime_type};base64,{encoded_image}"
                    base64_images.append(base64_image)
            except FileNotFoundError:
                pass

        #categories in a pretty format
        categories = row['categories'].split(',') if row['categories'] else []

        liked_by = []
        if row['liked_by_user_ids']:
            liked_by = list(map(int, row['liked_by_user_ids'].split(',')))

        spot_data = {
            "Id": row['id'],
            "Name": row['name'],
            "Description": row['description'],
            "Geolocation": row['geolocation'],
            "user_id": row['user_id'],
            "nickname": row['nickname'] or "Unknown",
            "Time": row['timestamp'],
            "Images": base64_images,
            "likes": row['likes_count'],
            "liked_by": liked_by,
            "categories": categories,
            "comments": row['comments_count']
        }
        spots_list.append(spot_data)

    return jsonify(spots_list)

@app.route('/api/spots', methods=['POST'])
@google_oauth_required
def add_spot():
    data = request.json
    
    name = data.get('spotName')
    description = data.get('Description')
    geolocation = f"{data['Geolocation']['lat']},{data['Geolocation']['lng']}" if data.get('Geolocation') else None
    email = data.get('userEmail')
    user = get_user_info_by_email(email)
    user_id = user["id"]
    images = data.get('images')

    
    timestamp = datetime.now(timezone.utc).isoformat()
    
    categories = data.get('categories')


    db = get_db()
    cursor = db.cursor()
    cursor.execute("INSERT INTO spots (Name, Description, Geolocation, user_id, timestamp) VALUES (?, ?, ?, ?, ?)",
                   (name, description, geolocation, user_id, timestamp))
    spot_id = cursor.lastrowid
    db.commit()

    

    for tag in categories:
        cursor.execute("SELECT id FROM tags WHERE tag_name = ?", (tag, ))
        tag_id = cursor.fetchone()[0]

        cursor.execute("INSERT INTO spot_tags (spot_id, tag_id) VALUES (?, ?)", (spot_id, tag_id, ))
    db.commit()
    
    try:
        image_paths = []
        for index, base64_image in enumerate(images):
            image_path = save_base64_image(base64_image, spot_id, index)
            image_paths.append(image_path)
            cursor.execute('INSERT INTO spot_images (spot_id, file_path) VALUES (?, ?)', (spot_id, image_path))

        db.commit()
    except TypeError:  
        pass

    return jsonify({'message': 'Spot added successfully!'}), 201

@app.route('/api/spots/<int:spot_id>', methods=['DELETE'])
@google_oauth_required
def delete_spot(spot_id):
    db = get_db()
    cursor = db.cursor()

    cursor.execute("SELECT file_path FROM spot_images WHERE spot_id = ?", (spot_id,))
    images = cursor.fetchall()

    cursor.execute("DELETE FROM spots WHERE id = ?", (spot_id,))
    db.commit()

    for image in images:
        file_path = image['file_path']
        if os.path.exists(file_path):
            os.remove(file_path)  

    return jsonify({"message": "Spot and associated images deleted successfully."}), 200

@app.route('/api/spots/<int:spot_id>', methods=['PUT'])
@google_oauth_required
def update_spot(spot_id):
    data = request.json
    name = data.get('spotName')
    description = data.get('Description')
    geolocation = f"{data['Geolocation']['lat']},{data['Geolocation']['lng']}" if data.get('Geolocation') else None
    images = data.get('images')  
    timestamp = datetime.now(timezone.utc).isoformat()
    categories = data.get('categories')

    db = get_db()
    cursor = db.cursor()


    cursor.execute("""
        UPDATE spots
        SET Name = ?, Description = ?, Geolocation = ?, timestamp = ?
        WHERE id = ?
    """, (name, description, geolocation, timestamp, spot_id))

    cursor.execute("DELETE from spot_tags WHERE spot_id = ?", ( spot_id,))

    for tag in categories:
        cursor.execute("SELECT id FROM tags WHERE tag_name = ?", (tag, ))
        tag_id = cursor.fetchone()[0]

        cursor.execute("INSERT INTO spot_tags (spot_id, tag_id) VALUES (?, ?)", (spot_id, tag_id, ))
    db.commit()


    if images:
        cursor.execute("DELETE FROM spot_images WHERE spot_id = ?", (spot_id,))
        db.commit()
        
        for index, base64_image in enumerate(images):
            image_path = save_base64_image(base64_image, spot_id, index)
            cursor.execute('INSERT INTO spot_images (spot_id, file_path) VALUES (?, ?)', (spot_id, image_path))

    db.commit()

    return jsonify({'message': 'Spot updated successfully!'}), 200


#LIKES SPOTS
@app.route('/api/spots/<int:spot_id>/likes', methods=['POST'])
@google_oauth_required
def add_like(spot_id):
    conn = get_db()
    cursor = conn.cursor()

    data = request.json
    user_id = data.get('user_id')

    cursor.execute("SELECT * FROM spots WHERE id = ?", (spot_id,))
    spot = cursor.fetchone()
    if spot is None:
        return jsonify({"error": "Spot not found"}), 404

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    cursor.execute("SELECT * FROM spot_likes WHERE spot_id = ? AND user_id = ?", (spot_id, user_id))
    like = cursor.fetchone()
    if like:
        return jsonify({"message": "Like already exists"}), 409 

    cursor.execute("INSERT INTO spot_likes (spot_id, user_id) VALUES (?, ?)", (spot_id, user_id))
    conn.commit()

    return "", 201

@app.route('/api/spots/<int:spot_id>/likes/<int:user_id>', methods=['DELETE']) 
@google_oauth_required
def delete_like(spot_id, user_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM spots WHERE id = ?", (spot_id,))
    spot = cursor.fetchone()
    if spot is None:
        return jsonify({"error": "Spot not found"}), 404

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    cursor.execute("SELECT * FROM spot_likes WHERE spot_id = ? AND user_id = ?", (spot_id, user_id))
    like = cursor.fetchone()
    if like is None:
        return jsonify({"error": "Like not found"}), 404

    cursor.execute("DELETE FROM spot_likes WHERE spot_id = ? AND user_id = ?", (spot_id, user_id))
    conn.commit()

    return "", 204


#COMMENTS
@app.route('/api/spots/<int:spot_id>/comment', methods=['POST'])
@google_oauth_required
def add_comment(spot_id):
    db = get_db()
    cursor = db.cursor()

    data = request.json
    userEmail = data.get('userEmail')
    user = get_user_info_by_email(userEmail)
    user_id = user["id"]
    comment = data.get('comment')
    image_base64 = data.get('image')

    timestamp = datetime.now(timezone.utc).isoformat()

    cursor.execute("SELECT * FROM spots WHERE id = ?", (spot_id,))
    spot = cursor.fetchone()

    if spot is None:
        return jsonify({"error": "Spot not found"}), 404

    db.commit() 

    cursor.execute(
        "INSERT INTO comments (spot_id, user_id, comment, timestamp) VALUES (?, ?, ?, ?)",
        (spot_id, user_id, comment, timestamp)
    )
    comment_id = cursor.lastrowid

    if image_base64:
        try:
            image_path = save_base64_comment_image(image_base64, comment_id)
            cursor.execute(
                "INSERT INTO comment_images (comment_id, file_path) VALUES (?, ?)",
                (comment_id, image_path)
            )
        except Exception as e:
            return jsonify({"error": f"Failed to save image: {str(e)}"}), 500



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

        cursor.execute("SELECT user_id FROM comment_likes WHERE comment_id = ?", (comment["id"],))
        likes = cursor.fetchall()

        cursor.execute("SELECT file_path FROM comment_images WHERE comment_id = ?", (comment["id"],))
        image_record = cursor.fetchone()
        image_base64 = None

        if image_record:
            image_path = image_record["file_path"]
            try:
                with open(image_path, "rb") as image_file:
                    image_base64 = f"data:image/{image_path.split('.')[-1]};base64," + base64.b64encode(image_file.read()).decode('utf-8')
            except Exception as e:
                print(f"Error loading image {image_path}: {e}")

        comment_data = {
            "id": comment["id"],
            "userName": user["nickname"],
            "userEmail": user["email"],
            "comment": comment["comment"],
            "timestamp": comment["timestamp"],
            "likes": len(likes),
            "liked_by": [like["user_id"] for like in likes],
            "image": image_base64  # Base64  bilde
        }
        comments_list.append(comment_data)

    return jsonify(comments_list)


@app.route('/api/spots/<int:comment_id>/comment', methods=['DELETE'])
@google_oauth_required
def delete_comment(comment_id):
    conn = get_db()
    cursor = conn.cursor()

    # Retrieve the image file path (if exists)
    cursor.execute("SELECT file_path FROM comment_images WHERE comment_id = ?", (comment_id,))
    image_record = cursor.fetchone()

    if image_record:
        image_path = image_record["file_path"]
        if os.path.exists(image_path):
            try:
                os.remove(image_path)
            except Exception as e:
                print(f"Error deleting image file {image_path}: {e}")

        cursor.execute("DELETE FROM comment_images WHERE comment_id = ?", (comment_id,))

    cursor.execute("DELETE FROM comments WHERE id = ?", (comment_id,))
    conn.commit()

    if cursor.rowcount > 0:
        return jsonify({"message": "Comment and associated image deleted successfully"}), 200
    else:
        return jsonify({"error": "Comment not found"}), 404

import os
import base64

import os

@app.route('/api/spots/<int:comment_id>/comment', methods=['PATCH'])
@google_oauth_required
def update_comment(comment_id):
    db = get_db()
    cursor = db.cursor()

    data = request.json
    comment_text = data.get('comment', None)
    image_base64 = data.get('image', None)  

    cursor.execute("SELECT * FROM comments WHERE id = ?", (comment_id,))
    comment = cursor.fetchone()

    if not comment:
        return jsonify({"error": "Comment doesn't exist."}), 400

    cursor.execute("SELECT file_path FROM comment_images WHERE comment_id = ?", (comment_id,))
    image_record = cursor.fetchone()
    old_image_path = image_record["file_path"] if image_record else None

    if (comment_text is None or comment_text.strip() == "") and image_base64 is None:
        return jsonify({"error": "Comment must contain either text or an image"}), 400

    timestamp = datetime.now(timezone.utc).isoformat()

    #image updates 
    if image_base64 is None:
        if old_image_path and os.path.exists(old_image_path):
            os.remove(old_image_path)  
        cursor.execute("DELETE FROM comment_images WHERE comment_id = ?", (comment_id,))
    elif image_base64 is not None:  
        if old_image_path and os.path.exists(old_image_path):
            os.remove(old_image_path) 

        new_image_path = save_base64_comment_image(image_base64, comment_id)  
        if old_image_path:
            cursor.execute("UPDATE comment_images SET file_path = ? WHERE comment_id = ?", (new_image_path, comment_id))
        else:
            cursor.execute("INSERT INTO comment_images (comment_id, file_path) VALUES (?, ?)", (comment_id, new_image_path))

    #text updates
    if comment_text and comment_text.strip() != comment["comment"]:
        cursor.execute("UPDATE comments SET comment = ?, timestamp = ? WHERE id = ?", (comment_text, timestamp, comment_id))

    db.commit()
    return jsonify({"message": "Comment updated successfully"}), 200



#LIKES COMMENTS
@app.route('/api/comments/<int:comment_id>/likes', methods=['POST'])
@google_oauth_required
def add_like_to_comment(comment_id):
    conn = get_db()
    cursor = conn.cursor()

    data = request.json
    user_id = data.get('user_id')

    cursor.execute("SELECT * FROM comments WHERE id = ?", (comment_id,))
    comment = cursor.fetchone()
    if comment is None:
        return jsonify({"error": "Comment not found"}), 404

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    # Check if the like already exists to prevent duplicate likes
    cursor.execute("SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?", (comment_id, user_id))
    like = cursor.fetchone()
    if like:
        return jsonify({"message": "Like already exists"}), 409 

    cursor.execute("INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)", (comment_id, user_id))
    conn.commit()

    return "", 201

@app.route('/api/comments/<int:comment_id>/likes/<int:user_id>', methods=['DELETE']) 
@google_oauth_required
def delete_like_from_comment(comment_id, user_id):
    conn = get_db()
    cursor = conn.cursor()

    cursor.execute("SELECT * FROM comments WHERE id = ?", (comment_id,))
    comment = cursor.fetchone()
    if comment is None:
        return jsonify({"error": "comment not found"}), 404

    cursor.execute("SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    if user is None:
        return jsonify({"error": "User not found"}), 404

    cursor.execute("SELECT * FROM comment_likes WHERE comment_id = ? AND user_id = ?", (comment_id, user_id))
    like = cursor.fetchone()
    if like is None:
        return jsonify({"error": "Like not found"}), 404

    cursor.execute("DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?", (comment_id, user_id))
    conn.commit()

    return "", 204





@app.teardown_appcontext
def close_connection(exception):
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
