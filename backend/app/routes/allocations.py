from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy import extract

from app import db
from app.models import ProductAllocation

bp = Blueprint("allocations", __name__)


@bp.route("", methods=["GET"])
def get_all():
    sales_person_id = request.args.get("sales_person_id", type=int)
    product_id = request.args.get("product_id", type=int)
    month = request.args.get("month")

    query = ProductAllocation.query

    if sales_person_id:
        query = query.filter_by(sales_person_id=sales_person_id)
    if product_id:
        query = query.filter_by(product_id=product_id)
    if month:
        year, mon = map(int, month.split("-"))
        query = query.filter(
            extract("year", ProductAllocation.allocation_date) == year,
            extract("month", ProductAllocation.allocation_date) == mon,
        )

    allocations = query.order_by(ProductAllocation.allocation_date.desc()).all()
    return jsonify([a.to_dict() for a in allocations])


@bp.route("/<int:id>", methods=["GET"])
def get_one(id):
    allocation = ProductAllocation.query.get_or_404(id)
    return jsonify(allocation.to_dict())


@bp.route("", methods=["POST"])
def create():
    data = request.get_json() or {}

    required = ["sales_person_id", "product_id", "quantity"]
    for field in required:
        if field not in data or data[field] is None or data[field] == "":
            return jsonify({"error": f"{field} is required"}), 400

    allocation_date = None
    if data.get("allocation_date"):
        allocation_date = datetime.strptime(data["allocation_date"], "%Y-%m-%d").date()

    allocation = ProductAllocation(
        sales_person_id=int(data["sales_person_id"]),
        product_id=int(data["product_id"]),
        quantity=float(data["quantity"]),
        allocation_date=allocation_date,
        notes=data.get("notes"),
    )
    db.session.add(allocation)
    db.session.commit()
    return jsonify(allocation.to_dict()), 201


@bp.route("/<int:id>", methods=["PUT"])
def update(id):
    allocation = ProductAllocation.query.get_or_404(id)
    data = request.get_json() or {}

    if "quantity" in data:
        allocation.quantity = float(data["quantity"])
    if "allocation_date" in data and data["allocation_date"]:
        allocation.allocation_date = datetime.strptime(data["allocation_date"], "%Y-%m-%d").date()
    if "notes" in data:
        allocation.notes = data["notes"]
    if "sales_person_id" in data:
        allocation.sales_person_id = int(data["sales_person_id"])
    if "product_id" in data:
        allocation.product_id = int(data["product_id"])

    db.session.commit()
    return jsonify(allocation.to_dict())


@bp.route("/<int:id>", methods=["DELETE"])
def delete(id):
    allocation = ProductAllocation.query.get_or_404(id)
    db.session.delete(allocation)
    db.session.commit()
    return jsonify({"message": "Allocation deleted successfully"})