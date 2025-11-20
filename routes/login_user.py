from flask import Blueprint, request, jsonify, current_app
from werkzeug.security import check_password_hash

login_bp = Blueprint('login', __name__, url_prefix='/login')

@login_bp.route('/user', methods=['POST'])
def login_user():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    if not username or not password:
        return jsonify({'success': False, 'error': 'Username and password are required'}), 400

    try:
        mysql = current_app.config["MYSQL"]
        cursor = mysql.connection.cursor()

        cursor.execute("SELECT id, password FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'success': False, 'error': 'Account not found'}), 404

        if check_password_hash(user['password'], password):
            otp = "1234"
            cursor.execute("UPDATE users SET otp_code = %s, otp_verified = FALSE WHERE id = %s", (otp, user['id']))
            mysql.connection.commit()

            return jsonify({'success': True, 'message': 'Login successful. OTP sent.'}), 200
        else:
            return jsonify({'success': False, 'error': 'Incorrect password'}), 401

    except Exception as e:
        print("❌ Login error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500