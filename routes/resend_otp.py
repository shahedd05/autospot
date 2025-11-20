from flask import Blueprint, request, jsonify, current_app
from datetime import datetime, timedelta

resend_bp = Blueprint('resend', __name__, url_prefix='/resend')

@resend_bp.route('/otp', methods=['POST'])
def resend_otp():
    mysql = current_app.config.get("MYSQL")
    if not mysql:
        return jsonify({'error': 'Database connection not initialized'}), 500

    cursor = mysql.connection.cursor()
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({'error': 'Email is required'}), 400

    # تحقق من وجود المستخدم في pending_users
    cursor.execute("SELECT username FROM pending_users WHERE email=%s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({'error': 'No pending registration found for this email'}), 404

    # تحديث الكود الثابت في قاعدة البيانات
    otp_code = "1234"
    otp_expiry = datetime.now() + timedelta(minutes=5)

    cursor.execute("""
        UPDATE pending_users SET otp_code=%s, otp_expiry=%s, attempts=0
        WHERE email=%s
    """, (otp_code, otp_expiry, email))
    mysql.connection.commit()

    cursor.close()
    return jsonify({'message': 'OTP reset to 1234'}), 200