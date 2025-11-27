from flask import Blueprint, request, jsonify, current_app
import traceback
import MySQLdb.cursors
from werkzeug.security import check_password_hash
import random

# ✅ تعريف الـ Blueprint باسم login_bp
login_user_bp = Blueprint('login_user', __name__, url_prefix='/login')

@login_user_bp.route('/user', methods=['POST'])
def login_user():
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        username = (data.get('username') or '').strip()
        password = (data.get('password') or '').strip()

        if not username or not password:
            return jsonify({'success': False, 'error': 'Username and password are required'}), 400

        mysql = current_app.config["MYSQL"]
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        # ✅ جلب بيانات المستخدم من جدول users
        cursor.execute("SELECT id, password_hash FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # ✅ تحقق من كلمة المرور باستخدام التشفير
        if not check_password_hash(user['password_hash'], password):
            return jsonify({'success': False, 'error': 'Incorrect password'}), 401

        # ✅ توليد OTP ثابت أو عشوائي
        otp_code = "1234"  # ثابت للتجربة، أو random.randint(1000, 9999) لو بدك عشوائي
        cursor.execute("UPDATE users SET otp=%s WHERE id=%s", (otp_code, user['id']))
        mysql.connection.commit()

        return jsonify({
            'success': True,
            'message': 'Login successful, OTP sent',
            'otp': otp_code
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': str(e)}), 500
    finally:
        if cursor:
            cursor.close()