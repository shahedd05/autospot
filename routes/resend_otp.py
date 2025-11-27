from flask import Blueprint, request, jsonify, current_app
import MySQLdb.cursors
from datetime import datetime, timedelta

resend_bp = Blueprint('resend', __name__, url_prefix='/resend')

@resend_bp.route('/otp', methods=['POST'])
def resend_otp():
    cursor = None
    try:
        data = request.get_json(silent=True) or {}
        username = (data.get('username') or '').strip()

        if not username:
            return jsonify({'success': False, 'error': 'Username is required'}), 400

        mysql = current_app.config["MYSQL"]
        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)

        # ✅ أولاً نبحث في pending_users
        cursor.execute("SELECT id FROM pending_users WHERE username=%s", (username,))
        pending_user = cursor.fetchone()

        if pending_user:
            otp = "1234"
            expiry = datetime.now() + timedelta(minutes=5)
            cursor.execute("UPDATE pending_users SET otp_code=%s, otp_expiry=%s WHERE id=%s",
                           (otp, expiry, pending_user['id']))
            mysql.connection.commit()
            return jsonify({'success': True, 'message': 'OTP resent for pending user'}), 200

        # ✅ إذا مش موجود في pending_users، نبحث في users
        cursor.execute("SELECT id FROM users WHERE username=%s", (username,))
        user = cursor.fetchone()

        if user:
            otp = "1234"
            expiry = datetime.now() + timedelta(minutes=5)
            cursor.execute("UPDATE users SET otp_code=%s, otp_expiry=%s, otp_verified=FALSE WHERE id=%s",
                           (otp, expiry, user['id']))
            mysql.connection.commit()
            return jsonify({'success': True, 'message': 'OTP resent for active user'}), 200

        return jsonify({'success': False, 'error': 'User not found'}), 404

    except Exception as e:
        print("❌ Resend OTP error:", type(e).__name__, str(e))
        return jsonify({'success': False, 'error': 'Server error. Please try again later.'}), 500

    finally:
        if cursor:
            cursor.close()