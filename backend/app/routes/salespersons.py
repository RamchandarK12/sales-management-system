from flask import Blueprint, request, jsonify
from datetime import datetime

from app import db
from app.models import SalesPerson

bp = Blueprint("salespersons", __name__)


@bp.route("", methods=["GET"])
def get_all():
    status = request.args.get("status")
    query = SalesPerson.query
    if status:
        query = query.filter_by(status=status)
    persons = query.order_by(SalesPerson.name).all()
    return jsonify([p.to_dict() for p in persons])


@bp.route("/<int:id>", methods=["GET"])
def get_one(id):
    person = SalesPerson.query.get_or_404(id)
    return jsonify(person.to_dict())


@bp.route("", methods=["POST"])
def create():
    data = request.get_json() or {}

    if not data.get("name"):
        return jsonify({"error": "Name is required"}), 400

    joining_date = None
    if data.get("joining_date"):
        joining_date = datetime.strptime(data["joining_date"], "%Y-%m-%d").date()

    person = SalesPerson(
        name=data["name"].strip(),
        phone=data.get("phone"),
        joining_date=joining_date,
        status=data.get("status", "Active"),
        monthly_target=float(data.get("monthly_target") or 0),
    )
    db.session.add(person)
    db.session.commit()
    return jsonify(person.to_dict()), 201


@bp.route("/<int:id>", methods=["PUT"])
def update(id):
    person = SalesPerson.query.get_or_404(id)
    data = request.get_json() or {}

    if "name" in data and data["name"]:
        person.name = data["name"].strip()
    if "phone" in data:
        person.phone = data["phone"]
    if "joining_date" in data and data["joining_date"]:
        person.joining_date = datetime.strptime(data["joining_date"], "%Y-%m-%d").date()
    if "status" in data:
        person.status = data["status"]
    if "monthly_target" in data:
        person.monthly_target = float(data["monthly_target"] or 0)

    db.session.commit()
    return jsonify(person.to_dict())


@bp.route("/<int:id>", methods=["DELETE"])
def delete(id):
    person = SalesPerson.query.get_or_404(id)
    db.session.delete(person)
    db.session.commit()
    return jsonify({"message": "Sales person deleted successfully"})