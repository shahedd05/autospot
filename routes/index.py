from flask import Blueprint, render_template

# إنشاء Blueprint لصفحة index
index_bp = Blueprint('index', __name__, template_folder='templates', static_folder='static')

@index_bp.route('/index')  # هنا غيرت المسار
def index():
    """
    تعرض صفحة index (الصفحة الرئيسية) لموقع autoSpot.
    """
    return render_template('index.html')
