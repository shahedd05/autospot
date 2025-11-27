from flask import Blueprint, request, jsonify, current_app, render_template
from werkzeug.security import generate_password_hash
import MySQLdb.cursors

reset_bp = Blueprint('reset', __name__, url_prefix='/reset_password')

# عرض صفحة إعادة تعيين كلمة المرور
@reset_bp.route('', methods=['GET'])
def show_reset_page():
    return render_template('reset_password.html')

# تحديث كلمة المرور بناءً على اسم المستخدم
@reset_bp.route('/update-password', methods=['POST'])
def update_password():
    cursor = None
    try:
        data = request.get_json(silent=True) or {}

        username = (data.get('username') or '').strip()
        new_password = (data.get('newPassword') or '').strip()
        confirm_password = (data.get('confirmPassword') or '').strip()

        # ✅ تحقق من الحقول
        if not username or not new_password or not confirm_password:
            return jsonify({'success': False, 'error': 'All fields are required'}), 400

        if new_password != confirm_password:
            return jsonify({'success': False, 'error': 'Passwords do not match'}), 400

        mysql = current_app.config.get("MYSQL")
        if not mysql:
            return jsonify({'success': False, 'error': 'Database connection not initialized'}), 500

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT id, otp_verified FROM users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'success': False, 'error': 'Username not found'}), 404

        # ✅ تحقق أن المستخدم أدخل OTP صحيح قبل السماح بالتغيير
        if not user.get('otp_verified'):
            return jsonify({'success': False, 'error': 'OTP verification required before resetting password'}), 403

        # ✅ تشفير كلمة المرور الجديدة
        hashed_password = generate_password_hash(new_password)

        # ✅ تحديث كلمة المرور وإعادة تعيين حالة otp_verified
        cursor.execute("UPDATE users SET password_hash = %s, otp_verified = FALSE WHERE username = %s",
                       (hashed_password, username))
        mysql.connection.commit()

        return jsonify({'success': True, 'message': 'Password updated successfully'}), 200

    except Exception as e:
        print("❌ Reset password error:", type(e).__name__, str(e))
        return jsonify({'success': False, 'error': 'Server error. Please try again later.'}), 500

    finally:
        if cursor:
            cursor.close()