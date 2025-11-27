from flask import Blueprint, request, jsonify, current_app
import MySQLdb.cursors

verify_owner_login_otp_bp = Blueprint('verify_owner_login_otp', __name__, url_prefix='/verify')

@verify_owner_login_otp_bp.route('/owner-login-otp', methods=['POST'])
def verify_owner_login_otp():
    cursor = None
    try:
        data = request.get_json(force=True) or {}
        register_number = (data.get('registerNumber') or '').strip()
        otp = (data.get('otp') or '').strip()

        if not register_number or not otp:
            return jsonify({'success': False, 'error': 'Missing register number or OTP'}), 400

        mysql = current_app.config.get("MYSQL")
        if not mysql:
            return jsonify({'success': False, 'error': 'Database connection not initialized'}), 500

        cursor = mysql.connection.cursor(MySQLdb.cursors.DictCursor)
        cursor.execute("SELECT id, otp FROM owners WHERE register_number=%s", (register_number,))
        row = cursor.fetchone()

        if not row:
            return jsonify({'success': False, 'error': 'Owner not found'}), 404

        # ✅ تحقق من الكود (ثابت للتجربة)
        if otp != "1234":
            return jsonify({'success': False, 'error': 'Invalid OTP'}), 401

        # ✅ نجاح التحقق بدون تحديث عمود otp_verified
        return jsonify({'success': True, 'redirect': '/reset_password_owner'}), 200

    except Exception as e:
        print("❌ Verify owner login OTP error:", type(e).__name__, str(e))
        return jsonify({'success': False, 'error': 'Server error'}), 500
    finally:
        if cursor:
            cursor.close()