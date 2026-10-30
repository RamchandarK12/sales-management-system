from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from app.config import Config

db = SQLAlchemy()


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    db.init_app(app)
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    from app.routes.auth import bp as auth_bp
    from app.routes.salespersons import bp as salespersons_bp
    from app.routes.products import bp as products_bp
    from app.routes.allocations import bp as allocations_bp
    from app.routes.sales import bp as sales_bp
    from app.routes.expenses import bp as expenses_bp
    from app.routes.reports import bp as reports_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(salespersons_bp, url_prefix="/api/salespersons")
    app.register_blueprint(products_bp, url_prefix="/api/products")
    app.register_blueprint(allocations_bp, url_prefix="/api/allocations")
    app.register_blueprint(sales_bp, url_prefix="/api/sales")
    app.register_blueprint(expenses_bp, url_prefix="/api/expenses")
    app.register_blueprint(reports_bp, url_prefix="/api/reports")

    @app.route("/api/health")
    def health():
        return {"status": "ok", "message": "Sales Management System API is running"}

    with app.app_context():
        db.create_all()
        _seed_default_data()

    return app


def _seed_default_data():
    from app.models import ExpenseCategory, User
    from werkzeug.security import generate_password_hash

    defaults = [
        ("Petrol / Diesel", "Vehicle"),
        ("Vehicle Maintenance / Repair", "Vehicle"),
        ("Vehicle Insurance", "Vehicle"),
        ("Office Rent", "Business"),
        ("Electricity", "Business"),
        ("Staff Salary", "Business"),
        ("Miscellaneous", "Other"),
    ]

    for name, cat_type in defaults:
        if not ExpenseCategory.query.filter_by(name=name).first():
            db.session.add(ExpenseCategory(name=name, type=cat_type))

    if not User.query.filter_by(username="admin").first():
        admin = User(
            username="admin",
            password_hash=generate_password_hash("admin123"),
            role="Admin",
        )
        db.session.add(admin)

    db.session.commit()