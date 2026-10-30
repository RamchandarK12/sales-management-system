from flask import Blueprint, request, jsonify
from datetime import date
from sqlalchemy import func, extract

from app import db
from app.models import (
    Sale, Expense, ProductAllocation,
    SalesPerson, Product, ExpenseCategory
)

bp = Blueprint("reports", __name__)


def _parse_month(month_str=None):
    if month_str:
        y, m = map(int, month_str.split("-"))
        return y, m
    today = date.today()
    return today.year, today.month


@bp.route("/dashboard", methods=["GET"])
def dashboard():
    year, month = _parse_month(request.args.get("month"))

    total_sales = (
        db.session.query(func.coalesce(func.sum(Sale.amount_received), 0))
        .filter(
            extract("year", Sale.sale_date) == year,
            extract("month", Sale.sale_date) == month,
        )
        .scalar()
    )

    total_expenses = (
        db.session.query(func.coalesce(func.sum(Expense.amount), 0))
        .filter(
            extract("year", Expense.expense_date) == year,
            extract("month", Expense.expense_date) == month,
        )
        .scalar()
    )

    vehicle_expenses = (
        db.session.query(func.coalesce(func.sum(Expense.amount), 0))
        .join(ExpenseCategory)
        .filter(
            ExpenseCategory.type == "Vehicle",
            extract("year", Expense.expense_date) == year,
            extract("month", Expense.expense_date) == month,
        )
        .scalar()
    )

    sales_by_person = (
        db.session.query(
            SalesPerson.id,
            SalesPerson.name,
            func.coalesce(func.sum(Sale.amount_received), 0).label("total"),
        )
        .outerjoin(
            Sale,
            (Sale.sales_person_id == SalesPerson.id)
            & (extract("year", Sale.sale_date) == year)
            & (extract("month", Sale.sale_date) == month),
        )
        .filter(SalesPerson.status == "Active")
        .group_by(SalesPerson.id, SalesPerson.name)
        .order_by(func.sum(Sale.amount_received).desc().nullslast())
        .all()
    )

    return jsonify({
        "month": f"{year}-{month:02d}",
        "total_sales": float(total_sales),
        "total_expenses": float(total_expenses),
        "profit": float(total_sales) - float(total_expenses),
        "vehicle_expenses": float(vehicle_expenses),
        "sales_by_person": [
            {"id": r.id, "name": r.name, "total": float(r.total)}
            for r in sales_by_person
        ],
    })


@bp.route("/monthly", methods=["GET"])
def monthly_report():
    year, month = _parse_month(request.args.get("month"))

    product_sales = (
        db.session.query(
            Product.id,
            Product.name,
            func.coalesce(func.sum(Sale.quantity_sold), 0).label("qty"),
            func.coalesce(func.sum(Sale.amount_received), 0).label("amount"),
        )
        .outerjoin(
            Sale,
            (Sale.product_id == Product.id)
            & (extract("year", Sale.sale_date) == year)
            & (extract("month", Sale.sale_date) == month),
        )
        .group_by(Product.id, Product.name)
        .having(func.sum(Sale.amount_received) > 0)
        .order_by(func.sum(Sale.amount_received).desc())
        .all()
    )

    expense_breakdown = (
        db.session.query(
            ExpenseCategory.type,
            ExpenseCategory.name,
            func.coalesce(func.sum(Expense.amount), 0).label("total"),
        )
        .outerjoin(
            Expense,
            (Expense.category_id == ExpenseCategory.id)
            & (extract("year", Expense.expense_date) == year)
            & (extract("month", Expense.expense_date) == month),
        )
        .group_by(ExpenseCategory.type, ExpenseCategory.name)
        .having(func.sum(Expense.amount) > 0)
        .order_by(ExpenseCategory.type, func.sum(Expense.amount).desc())
        .all()
    )

    total_sales = sum(float(r.amount) for r in product_sales)
    total_expenses = sum(float(r.total) for r in expense_breakdown)

    return jsonify({
        "month": f"{year}-{month:02d}",
        "total_sales": total_sales,
        "total_expenses": total_expenses,
        "profit": total_sales - total_expenses,
        "product_wise_sales": [
            {
                "product_id": r.id,
                "product_name": r.name,
                "quantity": float(r.qty),
                "amount": float(r.amount),
            }
            for r in product_sales
        ],
        "expense_breakdown": [
            {"type": r.type, "category": r.name, "amount": float(r.total)}
            for r in expense_breakdown
        ],
    })


@bp.route("/performance", methods=["GET"])
def sales_person_performance():
    year, month = _parse_month(request.args.get("month"))
    persons = SalesPerson.query.filter_by(status="Active").all()
    results = []

    for person in persons:
        allocated_rows = (
            db.session.query(
                Product.id,
                Product.name,
                func.coalesce(func.sum(ProductAllocation.quantity), 0).label("allocated"),
            )
            .join(ProductAllocation, ProductAllocation.product_id == Product.id)
            .filter(
                ProductAllocation.sales_person_id == person.id,
                extract("year", ProductAllocation.allocation_date) == year,
                extract("month", ProductAllocation.allocation_date) == month,
            )
            .group_by(Product.id, Product.name)
            .all()
        )

        sold_rows = (
            db.session.query(
                Product.id,
                Product.name,
                func.coalesce(func.sum(Sale.quantity_sold), 0).label("sold"),
                func.coalesce(func.sum(Sale.amount_received), 0).label("amount"),
            )
            .join(Sale, Sale.product_id == Product.id)
            .filter(
                Sale.sales_person_id == person.id,
                extract("year", Sale.sale_date) == year,
                extract("month", Sale.sale_date) == month,
            )
            .group_by(Product.id, Product.name)
            .all()
        )

        sold_map = {
            r.id: {"sold": float(r.sold), "amount": float(r.amount)}
            for r in sold_rows
        }

        products = []
        total_business = 0.0

        for a in allocated_rows:
            s = sold_map.get(a.id, {"sold": 0.0, "amount": 0.0})
            products.append({
                "product_id": a.id,
                "product_name": a.name,
                "allocated": float(a.allocated),
                "sold": s["sold"],
                "remaining": float(a.allocated) - s["sold"],
                "amount": s["amount"],
            })
            total_business += s["amount"]
            sold_map.pop(a.id, None)

        for pid, sdata in sold_map.items():
            prod = Product.query.get(pid)
            products.append({
                "product_id": pid,
                "product_name": prod.name if prod else "Unknown",
                "allocated": 0,
                "sold": sdata["sold"],
                "remaining": -sdata["sold"],
                "amount": sdata["amount"],
            })
            total_business += sdata["amount"]

        achievement = None
        if person.monthly_target and person.monthly_target > 0:
            achievement = round((total_business / person.monthly_target) * 100, 1)

        results.append({
            "sales_person_id": person.id,
            "name": person.name,
            "monthly_target": person.monthly_target,
            "total_business": total_business,
            "target_achievement": achievement,
            "products": products,
        })

    results.sort(key=lambda x: x["total_business"], reverse=True)
    for i, r in enumerate(results, 1):
        r["rank"] = i

    return jsonify({
        "month": f"{year}-{month:02d}",
        "performance": results,
    })


@bp.route("/vehicle", methods=["GET"])
def vehicle_expenses():
    year, month = _parse_month(request.args.get("month"))

    expenses = (
        db.session.query(Expense)
        .join(ExpenseCategory)
        .filter(
            ExpenseCategory.type == "Vehicle",
            extract("year", Expense.expense_date) == year,
            extract("month", Expense.expense_date) == month,
        )
        .order_by(Expense.expense_date.desc())
        .all()
    )

    by_category = {}
    total = 0.0
    for e in expenses:
        cat = e.category.name
        by_category[cat] = by_category.get(cat, 0) + e.amount
        total += e.amount

    return jsonify({
        "month": f"{year}-{month:02d}",
        "total": total,
        "by_category": [
            {"category": k, "amount": v} for k, v in by_category.items()
        ],
        "details": [e.to_dict() for e in expenses],
    })