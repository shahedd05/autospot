from flask import Blueprint, request, jsonify, current_app

verify_bp = Blueprint('verify_otp', __name__, url_prefix='/verify')

@verify_bp.route('/otp', methods=['POST'])
def verify_otp():
    return jsonify({'success': True, 'message': 'OTP route is working'})

    if not username or not otp:
        return jsonify({'success': False, 'error': 'Username and OTP are required'}), 400

    try:
        mysql = current_app.config["MYSQL"]
        cursor = mysql.connection.cursor()

        # ✅ جلب بيانات المستخدم من جدول pending_users
        cursor.execute("SELECT email, password FROM pending_users WHERE username = %s", (username,))
        user = cursor.fetchone()

        if not user:
            return jsonify({'success': False, 'error': 'User not found'}), 404

        # ✅ تحقق من أن الكود المدخل يساوي 1234
        if otp != "1234":
            return jsonify({'success': False, 'error': 'Incorrect OTP'}), 401

        # ✅ تحقق من أن البريد غير موجود مسبقًا في جدول users
        cursor.execute("SELECT * FROM users WHERE email = %s", (user['email'],))
        if cursor.fetchone():
            return jsonify({'success': False, 'error': 'Email already activated'}), 400

        # ✅ نقل المستخدم من pending_users إلى users
        cursor.execute("""
            INSERT INTO users (username, email, password)
            SELECT username, email, password FROM pending_users WHERE username = %s
        """, (username,))
        cursor.execute("DELETE FROM pending_users WHERE username = %s", (username,))
        mysql.connection.commit()

        return jsonify({'success': True, 'message': 'OTP verified and account activated'}), 200

    except Exception as e:
        print("❌ OTP error:", e)
        return jsonify({'success': False, 'error': str(e)}), 500