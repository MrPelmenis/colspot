from flask import Flask, url_for, jsonify, g, redirect
from authlib.integrations.flask_client import OAuth
from flask_jwt_extended import JWTManager, create_access_token
import sqlite3
from urllib.parse import urlencode

DATABASE = "main_db.db"
app = Flask(__name__)
app.secret_key = "...."

# JWT setup
app.config['JWT_SECRET_KEY'] = 'your-jwt-secret'
jwt = JWTManager(app)

person = {"name": None, "email": None}

# OAuth setup
oauth = OAuth(app)
google = oauth.register(
    name='google',
    client_id="290935281964-h2ac2lf6j0q1vulpfiic65vsndvv90fo.apps.googleusercontent.com",
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

@app.route('/login')
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
    
    redirect_url = url_for('return_hi', _external=True)  # Assuming your main page route is '/'
    params = {'token': access_token}
    
    return redirect(f"{redirect_url}?{urlencode(params)}")  # Redirect to /?token=<jwt_token>


@app.route("/")
def return_hi():
    return f"hi {person['email'] }"



@app.teardown_appcontext
def close_connection(exception):
    # Close the database connection when the context is destroyed
    db = getattr(g, '_database', None)
    if db is not None:
        db.close()

if __name__ == '__main__':
    app.run(debug=True)


