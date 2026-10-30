from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy import extract

from app import db
from app.models import Sale

bp = Blueprint("sales", __name__)


@bp.route("", methods=["GET"])
def get_all():
    sales_person_id = request.args.get("sales_person_id", type=int)
    product_id = request.args.get("product_id", type=int)
    month = request.args.get("month")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    query = Sale.query

    if sales_person_id:
        query = query.filter_by(sales_person_id=sales_person_id)
    if product_id:
        query = query.filter_by(product_id=product_id)
    if month:
        year, mon = map(int, month.split("-"))
        query = query.filter(
            extract("year", Sale.sale_date) == year,
            extract("month", Sale.sale_date) == mon,
        )
    if start_date:
        query = query.filter(Sale.sale_date >= datetime.strptime(start_date, "%Y-%m-%d").date())
    if end_date:
        query = query.filter(Sale.sale_date <= datetime.strptime(end_date, "%Y-%m-%d").date())

    sales = query.order_by(Sale.sale_date.desc()).all()
    return jsonify([s.to_dict() for s in sales])


@bp.route("/<int:id>", methods=["GET"])
def get_one(id):
    sale = Sale.query.get_or_404(id)
    return jsonify(sale.to_dict())


@bp.route("", methods=["POST"])
def create():
    data = request.get_json() or {}

    required = ["sales_person_id", "product_id", "quantity_sold", "amount_received"]
    for field in required:
        if field not in data or data[field] is None or data[field] == "":
            return jsonify({"error": f"{field} is required"}), 400

    sale_date = None
    if data.get("sale_date"):
        sale_date = datetime.strptime(data["sale_date"], "%Y-%m-%d").date()

    sale = Sale(
        sales_person_id=int(data["sales_person_id"]),
        product_id=int(data["product_id"]),
        quantity_sold=float(data["quantity_sold"]),
        amount_received=float(data["amount_received"]),
        sale_date=sale_date,
        notes=data.get("notes"),
    )
    db.session.add(sale)
    db.session.commit()
    return jsonify(sale.to_dict()), 201


@bp.route("/<int:id>", methods=["PUT"])
def update(id):
    sale = Sale.query.get_or_404(id)
    data = request.get_json() or {}

    if "quantity_sold" in data:
        sale.quantity_sold = float(data["quantity_sold"])
    if "amount_received" in data:
        sale.amount_received = float(data["amount_received"])
    if "sale_date" in data and data["sale_date"]:
        sale.sale_date = datetime.strptime(data["sale_date"], "%Y-%m-%d").date()
    if "notes" in data:
        sale.notes = data["notes"]
    if "sales_person_id" in data:
        sale.sales_person_id = int(data["sales_person_id"])
    if "product_id" in data:
        sale.product_id = int(data["product_id"])

    db.session.commit()
    return jsonify(sale.to_dict())


@bp.route("/<int:id>", methods=["DELETE"])
def delete(id):
    sale = Sale.query.get_or_404(id)
    db.session.delete(sale)
    db.session.commit()
    return jsonify({"message": "Sale deleted successfully"})