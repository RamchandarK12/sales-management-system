from flask import Blueprint, request, jsonify

from app import db
from app.models import Product

bp = Blueprint("products", __name__)


@bp.route("", methods=["GET"])
def get_all():
    active_param = request.args.get("active", "true").lower()
    query = Product.query
    if active_param == "true":
        query = query.filter_by(is_active=True)
    products = query.order_by(Product.name).all()
    return jsonify([p.to_dict() for p in products])


@bp.route("/<int:id>", methods=["GET"])
def get_one(id):
    product = Product.query.get_or_404(id)
    return jsonify(product.to_dict())


@bp.route("", methods=["POST"])
def create():
    data = request.get_json() or {}

    if not data.get("name"):
        return jsonify({"error": "Name is required"}), 400
    if data.get("price") is None:
        return jsonify({"error": "Price is required"}), 400

    product = Product(
        name=data["name"].strip(),
        price=float(data["price"]),
        unit=data.get("unit", "pcs"),
        description=data.get("description"),
        is_active=data.get("is_active", True),
    )
    db.session.add(product)
    db.session.commit()
    return jsonify(product.to_dict()), 201


@bp.route("/<int:id>", methods=["PUT"])
def update(id):
    product = Product.query.get_or_404(id)
    data = request.get_json() or {}

    if "name" in data and data["name"]:
        product.name = data["name"].strip()
    if "price" in data:
        product.price = float(data["price"])
    if "unit" in data:
        product.unit = data["unit"]
    if "description" in data:
        product.description = data["description"]
    if "is_active" in data:
        product.is_active = bool(data["is_active"])

    db.session.commit()
    return jsonify(product.to_dict())


@bp.route("/<int:id>", methods=["DELETE"])
def delete(id):
    product = Product.query.get_or_404(id)
    product.is_active = False
    db.session.commit()
    return jsonify({"message": "Product deactivated successfully"})