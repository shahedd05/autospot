from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import generate_password_hash
from datetime import datetime, timedelta
import re

register_bp = Blueprint('register', __name__, url_prefix='/register')

@register_bp.route('/user', methods=['POST'])
def register_user():
    mysql = current_app.config.get("MYSQL")
    if not mysql:
        print("❌ Database connection not initialized")
        return jsonify({'error': 'Database connection not initialized'}), 500

    cursor = mysql.connection.cursor()
    data = request.get_json()

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')
    confirm = data.get('confirm')

    if not all([username, email, password, confirm]):
        return jsonify({'error': 'All fields are required'}), 400

    if not re.match(r"[^@]+@[^@]+\.[^@]+", email):
        return jsonify({'error': 'Invalid email format'}), 400

    if password != confirm:
        return jsonify({'error': 'Passwords do not match'}), 400

    cursor.execute("SELECT * FROM pending_users WHERE email=%s", (email,))
    if cursor.fetchone():
        return jsonify({'error': 'Email already registered'}), 400

    hashed_password = generate_password_hash(password)
    otp = "1234"  # كود ثابت للتجربة
    otp_expiry = datetime.now() + timedelta(minutes=5)

    try:
        cursor.execute("""
            INSERT INTO pending_users (username, email, password, otp_code, otp_expiry)
            VALUES (%s, %s, %s, %s, %s)
        """, (username, email, hashed_password, otp, otp_expiry))
        mysql.connection.commit()

        print(f"✅ User {email} registered with OTP 1234")
        return jsonify({'success': True, 'message': 'User registered successfully. OTP is 1234'}), 200

    except Exception as e:
        print("❌ Server error:", e)  # 👈 طباعة الخطأ في التيرمنال
        return jsonify({'error': str(e)}), 500

    finally:
        cursor.close()