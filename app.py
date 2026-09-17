import os
import sqlite3
import hashlib
import secrets
from flask import Flask, request, jsonify, session, send_from_directory

app = Flask(__name__, static_folder='static', static_url_path='')
app.secret_key = 'helperhub-super-secret-key-123456'

DATABASE = 'database.db'

def hash_password(password, salt=None):
    if not salt:
        salt = secrets.token_hex(16)
    hashed = hashlib.sha256((password + salt).encode('utf-8')).hexdigest()
    return f"{salt}:{hashed}"

def verify_password(password, stored):
    try:
        salt, hashed = stored.split(':')
        return hash_password(password, salt) == stored
    except Exception:
        return False

def get_db():
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn

def init_db():
    with sqlite3.connect(DATABASE) as conn:
        # Create users table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT UNIQUE NOT NULL,
                password TEXT NOT NULL,
                phone TEXT NOT NULL,
                role TEXT NOT NULL CHECK(role IN ('customer', 'helper')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        # Create helpers table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS helpers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL UNIQUE,
                service_type TEXT NOT NULL,
                experience INTEGER NOT NULL,
                hourly_rate REAL NOT NULL,
                rating REAL DEFAULT 5.0,
                location TEXT NOT NULL,
                description TEXT,
                avatar_url TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        ''')
        # Create bookings table
        conn.execute('''
            CREATE TABLE IF NOT EXISTS bookings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER NOT NULL,
                helper_id INTEGER NOT NULL,
                booking_date TEXT NOT NULL,
                booking_time TEXT NOT NULL,
                status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'accepted', 'rejected', 'completed', 'cancelled')),
                notes TEXT,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE,
                FOREIGN KEY (helper_id) REFERENCES helpers(id) ON DELETE CASCADE
            )
        ''')
        conn.commit()

        # Seed data if helpers table is empty
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM helpers")
        if cursor.fetchone()[0] == 0:
            hashed_pw = hash_password('password123')
            helpers_data = [
                ("Rahul Sharma", "rahul@helperhub.com", "9876543211", "Electrician", 5, 250.0, "Delhi", "Expert electrician with 5 years experience in domestic and commercial repairs.", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1000&auto=format&fit=crop"),
                ("Amit Kumar", "amit@helperhub.com", "9876543212", "Plumber", 8, 300.0, "Mumbai", "Professional plumber specializing in leak repairs, pipe fitting, and bathroom installation.", "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=1000&auto=format&fit=crop"),
                ("Priya Verma", "priya@helperhub.com", "9876543213", "Cleaner", 4, 200.0, "Bangalore", "Home cleaning expert offering deep cleaning, office sanitization, and disinfection services.", "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=1000&auto=format&fit=crop"),
                ("Rohan Das", "rohan@helperhub.com", "9876543214", "Carpenter", 6, 280.0, "Delhi", "Woodwork and furniture expert. Highly skilled in bespoke furniture design and minor house repairs.", "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=1000&auto=format&fit=crop")
            ]
            for name, email, phone, service, exp, rate, loc, desc, avatar in helpers_data:
                cursor.execute(
                    "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, 'helper')",
                    (name, email, hashed_pw, phone)
                )
                user_id = cursor.lastrowid
                cursor.execute(
                    "INSERT INTO helpers (user_id, service_type, experience, hourly_rate, location, description, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                    (user_id, service, exp, rate, loc, desc, avatar)
                )
            conn.commit()

# Serve static files
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')

# AUTH ENDPOINTS
@app.route('/api/auth/register', methods=['POST'])
def register():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request payload"}), 400

    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    phone = data.get('phone')
    role = data.get('role')

    if not name or not email or not password or not phone or not role:
        return jsonify({"error": "Missing required user registration fields"}), 400

    if role not in ['customer', 'helper']:
        return jsonify({"error": "Invalid role"}), 400

    hashed_pw = hash_password(password)

    db = get_db()
    cursor = db.cursor()

    try:
        cursor.execute(
            "INSERT INTO users (name, email, password, phone, role) VALUES (?, ?, ?, ?, ?)",
            (name, email, hashed_pw, phone, role)
        )
        user_id = cursor.lastrowid

        if role == 'helper':
            service_type = data.get('service_type')
            experience = data.get('experience')
            hourly_rate = data.get('hourly_rate')
            location = data.get('location')
            description = data.get('description', '')
            avatar_url = data.get('avatar_url') or "https://cdn-icons-png.flaticon.com/512/4140/4140048.png"

            if not service_type or experience is None or hourly_rate is None or not location:
                db.rollback()
                return jsonify({"error": "Missing helper profile fields"}), 400

            cursor.execute(
                "INSERT INTO helpers (user_id, service_type, experience, hourly_rate, location, description, avatar_url) VALUES (?, ?, ?, ?, ?, ?, ?)",
                (user_id, service_type, int(experience), float(hourly_rate), location, description, avatar_url)
            )

        db.commit()
        session['user_id'] = user_id
        session['role'] = role
        return jsonify({"message": "User registered successfully", "user": {"id": user_id, "name": name, "email": email, "role": role}}), 201

    except sqlite3.IntegrityError:
        db.rollback()
        return jsonify({"error": "Email already registered"}), 409
    finally:
        db.close()

@app.route('/api/auth/login', methods=['POST'])
def login():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request payload"}), 400

    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Missing email or password"}), 400

    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
    user = cursor.fetchone()
    db.close()

    if user and verify_password(password, user['password']):
        session['user_id'] = user['id']
        session['role'] = user['role']
        return jsonify({
            "message": "Logged in successfully",
            "user": {
                "id": user['id'],
                "name": user['name'],
                "email": user['email'],
                "role": user['role']
            }
        }), 200

    return jsonify({"error": "Invalid email or password"}), 401

@app.route('/api/auth/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({"message": "Logged out successfully"}), 200

@app.route('/api/auth/me', methods=['GET'])
def me():
    user_id = session.get('user_id')
    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = get_db()
    cursor = db.cursor()
    cursor.execute("SELECT id, name, email, phone, role FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()

    helper_info = None
    if user and user['role'] == 'helper':
        cursor.execute("SELECT * FROM helpers WHERE user_id = ?", (user_id,))
        helper = cursor.fetchone()
        if helper:
            helper_info = dict(helper)

    db.close()

    if user:
        user_data = dict(user)
        if helper_info:
            user_data['helper_profile'] = helper_info
        return jsonify({"user": user_data}), 200

    return jsonify({"error": "User not found"}), 404

# HELPER ENDPOINTS
@app.route('/api/helpers', methods=['GET'])
def get_helpers():
    service_filter = request.args.get('service')
    location_filter = request.args.get('location')

    db = get_db()
    cursor = db.cursor()

    query = """
        SELECT helpers.*, users.name, users.phone, users.email
        FROM helpers
        JOIN users ON helpers.user_id = users.id
    """
    params = []
    conditions = []

    if service_filter:
        conditions.append("helpers.service_type LIKE ?")
        params.append(f"%{service_filter}%")
    if location_filter:
        conditions.append("helpers.location LIKE ?")
        params.append(f"%{location_filter}%")

    if conditions:
        query += " WHERE " + " AND ".join(conditions)

    cursor.execute(query, params)
    helpers = [dict(row) for row in cursor.fetchall()]
    db.close()

    return jsonify(helpers), 200

@app.route('/api/helpers/profile', methods=['PUT'])
def update_profile():
    user_id = session.get('user_id')
    role = session.get('role')

    if not user_id or role != 'helper':
        return jsonify({"error": "Unauthorized helper action"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request payload"}), 400

    service_type = data.get('service_type')
    experience = data.get('experience')
    hourly_rate = data.get('hourly_rate')
    location = data.get('location')
    description = data.get('description', '')
    avatar_url = data.get('avatar_url')

    if not service_type or experience is None or hourly_rate is None or not location:
        return jsonify({"error": "Missing required fields for profile update"}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute("""
            UPDATE helpers
            SET service_type = ?, experience = ?, hourly_rate = ?, location = ?, description = ?, avatar_url = ?
            WHERE user_id = ?
        """, (service_type, int(experience), float(hourly_rate), location, description, avatar_url, user_id))
        db.commit()
        return jsonify({"message": "Helper profile updated successfully"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

# BOOKING ENDPOINTS
@app.route('/api/bookings', methods=['POST'])
def create_booking():
    user_id = session.get('user_id')
    role = session.get('role')

    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401
    if role != 'customer':
        return jsonify({"error": "Only customers can book helper services"}), 403

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request payload"}), 400

    helper_id = data.get('helper_id')
    booking_date = data.get('booking_date')
    booking_time = data.get('booking_time')
    notes = data.get('notes', '')

    if not helper_id or not booking_date or not booking_time:
        return jsonify({"error": "Missing booking details"}), 400

    db = get_db()
    cursor = db.cursor()
    try:
        cursor.execute(
            "INSERT INTO bookings (customer_id, helper_id, booking_date, booking_time, notes, status) VALUES (?, ?, ?, ?, ?, 'pending')",
            (user_id, helper_id, booking_date, booking_time, notes)
        )
        db.commit()
        return jsonify({"message": "Booking created successfully", "booking_id": cursor.lastrowid}), 201
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

@app.route('/api/bookings', methods=['GET'])
def get_bookings():
    user_id = session.get('user_id')
    role = session.get('role')

    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    db = get_db()
    cursor = db.cursor()

    if role == 'customer':
        # Get bookings made by this customer
        query = """
            SELECT bookings.*, users.name AS helper_name, users.phone AS helper_phone, helpers.service_type, helpers.hourly_rate
            FROM bookings
            JOIN helpers ON bookings.helper_id = helpers.id
            JOIN users ON helpers.user_id = users.id
            WHERE bookings.customer_id = ?
            ORDER BY bookings.created_at DESC
        """
        cursor.execute(query, (user_id,))
    else:
        # Get bookings requested to this helper
        query = """
            SELECT bookings.*, users.name AS customer_name, users.phone AS customer_phone, users.email AS customer_email
            FROM bookings
            JOIN helpers ON bookings.helper_id = helpers.id
            JOIN users ON bookings.customer_id = users.id
            WHERE helpers.user_id = ?
            ORDER BY bookings.created_at DESC
        """
        cursor.execute(query, (user_id,))

    bookings = [dict(row) for row in cursor.fetchall()]
    db.close()

    return jsonify(bookings), 200

@app.route('/api/bookings/<int:booking_id>', methods=['PATCH'])
def update_booking_status(booking_id):
    user_id = session.get('user_id')
    role = session.get('role')

    if not user_id:
        return jsonify({"error": "Not authenticated"}), 401

    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid request payload"}), 400

    new_status = data.get('status')
    if new_status not in ['accepted', 'rejected', 'completed', 'cancelled']:
        return jsonify({"error": "Invalid booking status"}), 400

    db = get_db()
    cursor = db.cursor()

    # Get the booking
    cursor.execute("SELECT * FROM bookings WHERE id = ?", (booking_id,))
    booking = cursor.fetchone()

    if not booking:
        db.close()
        return jsonify({"error": "Booking not found"}), 404

    # Authorization checks
    if role == 'customer':
        if booking['customer_id'] != user_id:
            db.close()
            return jsonify({"error": "Unauthorized"}), 403
        if new_status != 'cancelled':
            db.close()
            return jsonify({"error": "Customers can only cancel bookings"}), 403
    elif role == 'helper':
        # Verify the helper owns this helper profile
        cursor.execute("SELECT id FROM helpers WHERE user_id = ?", (user_id,))
        helper = cursor.fetchone()
        if not helper or booking['helper_id'] != helper['id']:
            db.close()
            return jsonify({"error": "Unauthorized"}), 403
        if new_status == 'cancelled':
            db.close()
            return jsonify({"error": "Helpers cannot cancel bookings"}), 403

    try:
        cursor.execute("UPDATE bookings SET status = ? WHERE id = ?", (new_status, booking_id))
        db.commit()
        return jsonify({"message": f"Booking status updated to {new_status}"}), 200
    except Exception as e:
        db.rollback()
        return jsonify({"error": str(e)}), 500
    finally:
        db.close()

if __name__ == '__main__':
    init_db()
    app.run(debug=True, port=5000)
