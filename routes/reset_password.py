from flask import Blueprint, request, jsonify, current_app, render_template
from db import init_db
from werkzeug.security import generate_password_hash

# المسار الأساسي للـ Blueprint
reset_bp = Blueprint('reset', __name__, url_prefix='/reset_password')

# عرض صفحة إعادة تعيين كلمة المرور
@reset_bp.route('', methods=['GET'])
def show_reset_page():
    return render_template('reset_password.html')

# تحديث كلمة المرور بناءً على اسم المستخدم
@reset_bp.route('/update-password', methods=['POST'])
def update_password():
    try:
        print("🔧 Request received")
        print("🔧 Raw data:", request.data)

        data = request.get_json()
        print("🔧 Parsed JSON:", data)

        if not data:
            return jsonify({'error': 'Invalid or missing JSON'}), 400

        username = data.get('username')
        new_password = data.get('newPassword')
        confirm_password = data.get('confirmPassword')

        print("🔧 username:", username)
        print("🔧 new_password:", new_password)
        print("🔧 confirm_password:", confirm_password)

        if not username or not new_password or not confirm_password:
            return jsonify({'error': 'All fields are required'}), 400

        if new_password != confirm_password:
            return jsonify({'error': 'Passwords do not match'}), 400

        mysql = current_app.config["MYSQL"]
        print("🔧 DB initialized:", mysql)

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'error': 'Username not found'}), 404

        hashed_password = generate_password_hash(new_password)
        cursor.execute("UPDATE users SET password = %s WHERE username = %s", (hashed_password, username))
        mysql.connection.commit()

        return jsonify({'message': 'Password updated successfully'}), 200

    except Exception as e:
        print("🔧 mysql.connection:", mysql.connection)
        return jsonify({'error': 'Server error. Please try again later.'}), 500