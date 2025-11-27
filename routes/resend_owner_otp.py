from flask import Blueprint, request, jsonify, current_app
from MySQLdb.cursors import DictCursor
import traceback

resend_owner_otp_bp = Blueprint('resend_owner_otp', __name__, url_prefix='/resend')

@resend_owner_otp_bp.route('/owner-otp', methods=['POST'])
def resend_owner_otp():
    cursor = None
    try:
        data = request.get_json(force=True) or {}
        register_number = (data.get('registerNumber') or '').strip()

        if not register_number:
            return jsonify({'success': False, 'error': 'Register number is required'}), 400

        mysql = current_app.config['MYSQL']
        cursor = mysql.connection.cursor(DictCursor)

        # البحث أولاً في pending_owners
        cursor.execute("SELECT id FROM pending_owners WHERE register_number=%s", (register_number,))
        owner = cursor.fetchone()
        table_name = 'pending_owners'

        # إذا لم يوجد، البحث في owners
        if not owner:
            cursor.execute("SELECT id FROM owners WHERE register_number=%s", (register_number,))
            owner = cursor.fetchone()
            table_name = 'owners'

        if not owner:
            return jsonify({'success': False, 'error': 'Account not found'}), 404

        # رمز ثابت للتجربة
        otp = "1234"

        # تحديث الرمز في الجدول المناسب
        cursor.execute(f"UPDATE {table_name} SET otp=%s WHERE id=%s", (otp, owner['id']))
        mysql.connection.commit()

        return jsonify({
            'success': True,
            'message': f"🔄 OTP resent successfully. Your code is {otp} (demo)"
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': 'Server error: ' + str(e)}), 500
    finally:
        if cursor:
            cursor.close()
