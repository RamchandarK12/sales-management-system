from flask import Blueprint, request, jsonify
from werkzeug.security import check_password_hash, generate_password_hash
from datetime import datetime, timedelta
import jwt

from app import db
from app.models import User
from app.config import Config

bp = Blueprint("auth", __name__)


def _get_current_user():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header.replace("Bearer ", "").strip()
    if not token:
        return None
    try:
        payload = jwt.decode(token, Config.SECRET_KEY, algorithms=["HS256"])
        return User.query.get(payload.get("user_id"))
    except Exception:
        return None


def _require_admin():
    current = _get_current_user()
    if not current:
        return None, (jsonify({"error": "Unauthorized - please login again"}), 401)
    role = (current.role or "").strip().lower()
    if role != "admin":
        return None, (jsonify({"error": f"Admin only (your role is '{current.role}')"}), 403)
    return current, None


@bp.route("/login", methods=["POST"])
def login():
    data = request.get_json() or {}
    username = data.get("username")
    password = data.get("password")

    if not username or not password:
        return jsonify({"error": "Username and password are required"}), 400

    user = User.query.filter_by(username=username).first()
    if not user or not check_password_hash(user.password_hash, password):
        return jsonify({"error": "Invalid username or password"}), 401

    payload = {
        "user_id": user.id,
        "username": user.username,
        "role": user.role,
        "exp": datetime.utcnow() + timedelta(hours=Config.JWT_EXPIRATION_HOURS),
    }
    token = jwt.encode(payload, Config.SECRET_KEY, algorithm="HS256")
    return jsonify({"token": token, "user": user.to_dict()})


@bp.route("/me", methods=["GET"])
def me():
    user = _get_current_user()
    if not user:
        return jsonify({"error": "Unauthorized"}), 401
    return jsonify(user.to_dict())


@bp.route("/users", methods=["GET"])
def list_users():
    current, err = _require_admin()
    if err:
        return err
    users = User.query.order_by(User.username).all()
    return jsonify([u.to_dict() for u in users])


@bp.route("/users", methods=["POST"])
def create_user():
    current, err = _require_admin()
    if err:
        return err

    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    password = data.get("password") or ""
    role = data.get("role", "User")

    if not username or not password:
        return jsonify({"error": "Username and password required"}), 400
    if role not in ["Admin", "User"]:
        return jsonify({"error": "Role must be Admin or User"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    user = User(
        username=username,
        password_hash=generate_password_hash(password),
        role=role,
    )
    db.session.add(user)
    db.session.commit()
    return jsonify(user.to_dict()), 201


@bp.route("/users/<int:id>/reset-password", methods=["POST"])
def reset_password(id):
    current, err = _require_admin()
    if err:
        return err

    data = request.get_json() or {}
    new_password = data.get("new_password") or ""
    if len(new_password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400

    user = User.query.get_or_404(id)
    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": f"Password reset for {user.username}"})


@bp.route("/change-password", methods=["POST"])
def change_password():
    current = _get_current_user()
    if not current:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.get_json() or {}
    old_password = data.get("old_password") or ""
    new_password = data.get("new_password") or ""

    if not check_password_hash(current.password_hash, old_password):
        return jsonify({"error": "Old password is incorrect"}), 400
    if len(new_password) < 4:
        return jsonify({"error": "New password must be at least 4 characters"}), 400

    current.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "Password changed successfully"})


@bp.route("/forgot-password", methods=["POST"])
def forgot_password():
    data = request.get_json() or {}
    username = (data.get("username") or "").strip()
    reset_code = (data.get("reset_code") or "").strip()
    new_password = data.get("new_password") or ""

    if not username or not reset_code or not new_password:
        return jsonify({"error": "Username, reset code and new password are required"}), 400

    if reset_code != getattr(Config, "RESET_CODE", "123456"):
        return jsonify({"error": "Invalid reset code"}), 400
    if len(new_password) < 4:
        return jsonify({"error": "Password must be at least 4 characters"}), 400

    user = User.query.filter_by(username=username).first()
    if not user:
        return jsonify({"error": "Username not found"}), 404

    user.password_hash = generate_password_hash(new_password)
    db.session.commit()
    return jsonify({"message": "Password reset successfully. You can login now."})