from flask import Blueprint, request, jsonify, current_app
import MySQLdb.cursors
from werkzeug.security import check_password_hash

login_owner_bp = Blueprint('login_owner', __name__, url_prefix='/login')

@login_owner_bp.route('/owner', methods=['POST'])
def login_owner():
    cursor = None
    try:
        data = request.get_json(force=True) or {}
        register_number = (data.get('registerNumber') or '').strip()
        password = (data.get('password') or '').strip()

        if not register_number or not password:
            return jsonify({'success': False, 'error': 'Register number and password are required'}), 400

        mysql = current_app.config.get("MYSQL")
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        # ✅ البحث عن الحساب
        cursor.execute("""
            SELECT id, owner_name, email, password_hash
            FROM owners
            WHERE register_number=%s
            LIMIT 1
        """, (register_number,))
        owner = cursor.fetchone()

        if not owner:
            return jsonify({'success': False, 'error': 'Owner not found'}), 404

        # ✅ تحقق من كلمة المرور
        if not owner['password_hash'] or not isinstance(owner['password_hash'], str):
            return jsonify({'success': False, 'error': 'Password not set for this account'}), 400

        if not check_password_hash(owner['password_hash'], password):
            return jsonify({'success': False, 'error': 'Incorrect password'}), 401

        # ✅ نجاح الدخول → توليد OTP جديد للتجربة
        otp = "1234"  # ممكن توليد عشوائي لاحقًا
        cursor.execute("UPDATE owners SET otp=%s WHERE id=%s", (otp, owner['id']))
        mysql.connection.commit()

        return jsonify({'success': True, 'message': 'Login successful, OTP sent'}), 200

    except Exception as e:
        print("❌ Login owner error:", type(e).__name__, str(e))
        return jsonify({'success': False, 'error': 'Server error'}), 500
    finally:
        if cursor:
            cursor.close()