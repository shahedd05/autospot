from flask import Blueprint, request, jsonify, current_app
import MySQLdb.cursors
from datetime import datetime

verify_otp_bp = Blueprint('verify_otp', __name__, url_prefix='/verify')

@verify_otp_bp.route('/otp', methods=['POST'])
def verify_otp():
    mysql = current_app.config.get("MYSQL")
    if not mysql:
        return jsonify({'success': False, 'error': 'Database connection not initialized'}), 500

    cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
    data = request.get_json(silent=True) or {}

    username = (data.get('username') or '').strip()
    otp = (data.get('otp') or '').strip()

    if otp != "1234":
        return jsonify({'success': False, 'error': 'Invalid OTP'}), 400

    # ✅ أولاً نبحث في جدول pending_users
    cursor.execute("SELECT * FROM pending_users WHERE username=%s LIMIT 1", (username,))
    pending_user = cursor.fetchone()

    if pending_user:
        try:
            # نقل الحساب إلى users
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, created_at, otp_verified)
                VALUES (%s, %s, %s, %s, TRUE)
            """, (
                pending_user['username'],
                pending_user['email'],
                pending_user['password_hash'],
                datetime.now()
            ))

            cursor.execute("DELETE FROM pending_users WHERE id=%s", (pending_user['id'],))
            mysql.connection.commit()

            return jsonify({'success': True, 'message': 'Account verified and activated'}), 200
        except Exception as e:
            return jsonify({'success': False, 'error': str(e)}), 500
        finally:
            cursor.close()
        return

    # ✅ إذا مش موجود في pending_users، نبحث في users
    cursor.execute("SELECT * FROM users WHERE username=%s LIMIT 1", (username,))
    user = cursor.fetchone()

    if user:
        # تحقق من الـ OTP المخزن
        if otp == "1234":  # ثابت للتجربة
            cursor.execute("UPDATE users SET otp_verified=TRUE WHERE id=%s", (user['id'],))
            mysql.connection.commit()
            return jsonify({'success': True, 'message': 'Login verified successfully'}), 200
        else:
            return jsonify({'success': False, 'error': 'Invalid OTP'}), 400

    return jsonify({'success': False, 'error': 'User not found'}), 404