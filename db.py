from flask_mysqldb import MySQL
import config

def init_db(app):
    app.config['MYSQL_HOST'] = config.MYSQL_HOST
    app.config['MYSQL_USER'] = config.MYSQL_USER
    app.config['MYSQL_PASSWORD'] = config.MYSQL_PASSWORD
    app.config['MYSQL_DB'] = config.MYSQL_DB
    app.config['MYSQL_CURSORCLASS'] = config.MYSQL_CURSORCLASS

    return MySQL(app)
