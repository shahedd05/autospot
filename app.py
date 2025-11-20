from flask import Flask, render_template, Blueprint
from flask_cors import CORS
from db import init_db

# ✅ إنشاء التطبيق
app = Flask(__name__, static_folder='static', template_folder='templates')
CORS(app, supports_credentials=True)

# ✅ إعدادات قاعدة البيانات قبل أي استيراد
app.config['MYSQL_CURSORCLASS'] = 'DictCursor'
mysql = init_db(app)
app.config["MYSQL"] = mysql

# ✅ استيراد المسارات بعد التهيئة
from routes.register_user import register_bp
from routes.verify_otp import verify_bp
from routes.resend_otp import resend_bp
from routes.login_user import login_bp
from routes.reset_password import reset_bp

# ✅ تسجيل المسارات
app.register_blueprint(register_bp)
app.register_blueprint(verify_bp)
app.register_blueprint(resend_bp)
app.register_blueprint(login_bp)
app.register_blueprint(reset_bp)

# ✅ صفحات HTML (مسارات العرض فقط)
pages_bp = Blueprint('pages', __name__)

@pages_bp.route('/register_user')
def register_user_page():
    return render_template('register_user.html')

@pages_bp.route('/login_user')
def login_user_page():
    return render_template('login_user.html')

# ✅ تغيير مسار صفحة reset لتجنب التعارض مع Blueprint
@pages_bp.route('/reset_password_page')
def reset_password_page():
    return render_template('reset_password.html')

app.register_blueprint(pages_bp)

# ✅ تشغيل التطبيق
if __name__ == '__main__':
    app.run(debug=True)