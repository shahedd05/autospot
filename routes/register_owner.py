from flask import Blueprint, request, jsonify, current_app
from MySQLdb.cursors import DictCursor
from werkzeug.security import generate_password_hash
import random, traceback

register_owner_bp = Blueprint('register_owner', __name__)

@register_owner_bp.route('/register_owner', methods=['POST'])
def register_owner():
    cursor = None
    try:
        data = request.get_json(force=True) or {}
        reg = (data.get('registerNumber') or '').strip()
        nat = (data.get('nationalNumber') or '').strip()
        owner_name = (data.get('ownerName') or '').strip()
        email = (data.get('email') or '').strip()
        password = (data.get('password') or '').strip()

        if not reg or not nat or not owner_name or not email or not password:
            return jsonify({'error': 'All fields are required'}), 400

        mysql = current_app.config['MYSQL']
        cursor = mysql.connection.cursor(DictCursor)

        # ✅ تحقق إذا الحساب موجود بالفعل في owners
        cursor.execute("""
            SELECT id FROM owners WHERE register_number=%s AND national_number=%s
        """, (reg, nat))
        if cursor.fetchone():
            return jsonify({
                'error': 'Account already exists. Please login.',
                'redirect': '/login_owner'
            }), 409

        # ✅ تحقق إذا الحساب موجود في pending_owners
        cursor.execute("""
            SELECT id, otp FROM pending_owners WHERE register_number=%s AND national_number=%s
        """, (reg, nat))
        pending = cursor.fetchone()
        if pending:
            return jsonify({
                'error': 'Account is pending verification. Please enter the OTP to activate your account.',
                'redirect': '/otp',
                'otp': pending['otp']  # للتجربة فقط، في الإنتاج ما نرجع الكود هنا
            }), 409

        # توليد OTP جديد
        otp = str(random.randint(1000, 9999))

        # ✅ تشفير كلمة المرور قبل التخزين
        hashed_pw = generate_password_hash(password)

        # إدخال في جدول pending_owners
        cursor.execute("""
            INSERT INTO pending_owners (register_number, national_number, owner_name, email, password_hash, otp)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (reg, nat, owner_name, email, hashed_pw, otp))
        mysql.connection.commit()

        return jsonify({'success': True, 'ownerName': owner_name, 'otp': otp}), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'error': 'Server error: ' + str(e)}), 500
    finally:
        if cursor:
            cursor.close()