from flask import Blueprint, request, jsonify
from datetime import datetime
from sqlalchemy import extract

from app import db
from app.models import Expense, ExpenseCategory

bp = Blueprint("expenses", __name__)


@bp.route("/categories", methods=["GET"])
def get_categories():
    cats = ExpenseCategory.query.order_by(ExpenseCategory.type, ExpenseCategory.name).all()
    return jsonify([c.to_dict() for c in cats])


@bp.route("/categories", methods=["POST"])
def create_category():
    data = request.get_json() or {}
    if not data.get("name"):
        return jsonify({"error": "Name is required"}), 400

    existing = ExpenseCategory.query.filter_by(name=data["name"].strip()).first()
    if existing:
        return jsonify({"error": "Category already exists"}), 400

    cat = ExpenseCategory(
        name=data["name"].strip(),
        type=data.get("type", "Other"),
        description=data.get("description"),
    )
    db.session.add(cat)
    db.session.commit()
    return jsonify(cat.to_dict()), 201


@bp.route("", methods=["GET"])
def get_all():
    category_id = request.args.get("category_id", type=int)
    category_type = request.args.get("type")
    month = request.args.get("month")
    start_date = request.args.get("start_date")
    end_date = request.args.get("end_date")

    query = Expense.query

    if category_id:
        query = query.filter_by(category_id=category_id)
    if category_type:
        query = query.join(ExpenseCategory).filter(ExpenseCategory.type == category_type)
    if month:
        year, mon = map(int, month.split("-"))
        query = query.filter(
            extract("year", Expense.expense_date) == year,
            extract("month", Expense.expense_date) == mon,
        )
    if start_date:
        query = query.filter(Expense.expense_date >= datetime.strptime(start_date, "%Y-%m-%d").date())
    if end_date:
        query = query.filter(Expense.expense_date <= datetime.strptime(end_date, "%Y-%m-%d").date())

    expenses = query.order_by(Expense.expense_date.desc()).all()
    return jsonify([e.to_dict() for e in expenses])


@bp.route("/<int:id>", methods=["GET"])
def get_one(id):
    expense = Expense.query.get_or_404(id)
    return jsonify(expense.to_dict())


@bp.route("", methods=["POST"])
def create():
    data = request.get_json() or {}

    if not data.get("category_id"):
        return jsonify({"error": "category_id is required"}), 400
    if data.get("amount") is None:
        return jsonify({"error": "amount is required"}), 400

    expense_date = None
    if data.get("expense_date"):
        expense_date = datetime.strptime(data["expense_date"], "%Y-%m-%d").date()

    expense = Expense(
        category_id=int(data["category_id"]),
        amount=float(data["amount"]),
        expense_date=expense_date,
        description=data.get("description"),
        payment_mode=data.get("payment_mode", "Cash"),
    )
    db.session.add(expense)
    db.session.commit()
    return jsonify(expense.to_dict()), 201


@bp.route("/<int:id>", methods=["PUT"])
def update(id):
    expense = Expense.query.get_or_404(id)
    data = request.get_json() or {}

    if "category_id" in data:
        expense.category_id = int(data["category_id"])
    if "amount" in data:
        expense.amount = float(data["amount"])
    if "expense_date" in data and data["expense_date"]:
        expense.expense_date = datetime.strptime(data["expense_date"], "%Y-%m-%d").date()
    if "description" in data:
        expense.description = data["description"]
    if "payment_mode" in data:
        expense.payment_mode = data["payment_mode"]

    db.session.commit()
    return jsonify(expense.to_dict())


@bp.route("/<int:id>", methods=["DELETE"])
def delete(id):
    expense = Expense.query.get_or_404(id)
    db.session.delete(expense)
    db.session.commit()
    return jsonify({"message": "Expense deleted successfully"})