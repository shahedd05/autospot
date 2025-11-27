from flask import Flask, render_template, Blueprint
from flask_cors import CORS
from db import init_db

# ✅ إنشاء التطبيق
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app, supports_credentials=True)

# ✅ إعدادات قاعدة البيانات
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
mysql = init_db(app)
app.config["MYSQL"] = mysql

# ✅ استيراد المسارات بعد التهيئة
from routes.register_user import register_user_bp
from routes.verify_otp import verify_otp_bp

from routes.login_user import login_user_bp
from routes.reset_password import reset_bp
from routes.verify_company import verify_company_bp
from routes.register_owner import register_owner_bp
from routes.resend_owner_otp import resend_owner_otp_bp
from routes.login_owner import login_owner_bp
from routes.verify_owner_otp import verify_owner_otp_bp
from routes.reset_password_owner import reset_password_owner_bp
from routes.verify_owner_login_otp import verify_owner_login_otp_bp   # ✅ الاسم مطابق داخل الملف
from routes.resend_otp import resend_bp
from routes.index import index_bp
# ✅ تسجيل المسارات بشكل مباشر (بدون قائمة)
app.register_blueprint(register_user_bp)
app.register_blueprint(verify_otp_bp)
app.register_blueprint(resend_bp)
app.register_blueprint(login_user_bp)
app.register_blueprint(reset_bp)
app.register_blueprint(verify_company_bp)
app.register_blueprint(register_owner_bp)
app.register_blueprint(resend_owner_otp_bp)
app.register_blueprint(login_owner_bp)
app.register_blueprint(verify_owner_otp_bp)
app.register_blueprint(reset_password_owner_bp)
app.register_blueprint(verify_owner_login_otp_bp)
app.register_blueprint(index_bp)
# ✅ صفحات HTML (مسارات العرض فقط)
pages_bp = Blueprint('pages', __name__)

@pages_bp.route('/register_user')
def register_user_page():
    return render_template('register_user.html')

@pages_bp.route('/login_user')
def login_user_page():
    return render_template('login_user.html')

@pages_bp.route('/login_owner')
def login_owner_page():
    return render_template('login_owner.html')

@pages_bp.route('/reset_password')
def reset_password_page():
    return render_template('reset_password.html')

@pages_bp.route('/reset_password_owner')
def reset_password_owner_page():
    return render_template('reset_password_owner.html')

@pages_bp.route('/verify_company')
def verify_company_page():
    return render_template('verify_company.html')

@pages_bp.route('/register_owner')
def register_owner_page():
    return render_template('register_owner.html')

# ✅ تسجيل صفحات العرض
app.register_blueprint(pages_bp)

# ✅ تشغيل التطبيق
if __name__ == '__main__':
    app.run(debug=True)