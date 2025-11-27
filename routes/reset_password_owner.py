from flask import Blueprint, request, jsonify, current_app
from MySQLdb.cursors import DictCursor
from werkzeug.security import generate_password_hash
import traceback

reset_password_owner_bp = Blueprint('reset_password_owner', __name__, url_prefix='/reset')

# 🔹 إرسال OTP عند نسيان كلمة المرور
@reset_password_owner_bp.route('/owner', methods=['POST'])
def reset_password_owner():
    cursor = None
    try:
        data = request.get_json(force=True) or {}
        register_number = (data.get('registerNumber') or '').strip()

        if not register_number:
            return jsonify({'success': False, 'error': 'Register number is required'}), 400

        mysql = current_app.config['MYSQL']
        cursor = mysql.connection.cursor(DictCursor)

        # ✅ البحث في جدول owners فقط
        cursor.execute("SELECT id, email FROM owners WHERE register_number=%s", (register_number,))
        owner = cursor.fetchone()

        if not owner:
            return jsonify({'success': False, 'error': 'Owner account not found'}), 404

        # ✅ رمز ثابت للتجربة (يفضل لاحقاً توليد عشوائي)
        otp = "1234"

        # ✅ تحديث الـ OTP في جدول owners
        cursor.execute("UPDATE owners SET otp=%s WHERE id=%s", (otp, owner['id']))
        mysql.connection.commit()

        return jsonify({
            'success': True,
            'message': 'OTP sent successfully',
            'otp': otp,  # للعرض فقط أثناء التجربة
            'redirect': '/reset_password_owner'
        }), 200

    except Exception as e:
        traceback.print_exc()
        return jsonify({'success': False, 'error': 'Server error: ' + str(e)}), 500
    finally:
        if cursor:
            cursor.close()


# 🔹 تحديث كلمة المرور بعد التحقق من OTP
@reset_password_owner_bp.route('/password', methods=['POST'])
def update_password_owner():
    cursor = None
    try:
        data = request.get_json(force=True) or {}
        register_number = (data.get('registerNumber') or '').strip()
        new_password = (data.get('newPassword') or '').strip()

        if not register_number or not new_password:
            return jsonify({'success': False, 'error': 'Register number and new password are required'}), 400

        mysql = current_app.config['MYSQL']
        cursor = mysql.connection.cursor(DictCursor)

        # ✅ التحقق من وجود الحساب
        cursor.execute("SELECT id FROM owners WHERE register_number=%s", (register_number,))
        owner = cursor.fetchone()

        if not owner:
            return jsonify({'success': False, 'error': 'Owner account not found'}), 404

        # ✅ تشفير كلمة المرور الجديدة
        from werkzeug.security import generate_password_hash
        hashed_pw = generate_password_hash(new_password)

        # ✅ تحديث كلمة المرور وإلغاء الـ OTP
        cursor.execute("UPDATE owners SET password_hash=%s, otp=NULL WHERE id=%s", (hashed_pw, owner['id']))
        mysql.connection.commit()

        return jsonify({
            'success': True,
            'message': 'Password updated successfully',
            'redirect': '/login_owner'
        }), 200

    except Exception as e:
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'error': 'Server error: ' + str(e)}), 500
    finally:
        if cursor:
            cursor.close()