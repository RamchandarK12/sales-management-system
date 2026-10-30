from datetime import datetime, date
from app import db


class SalesPerson(db.Model):
    __tablename__ = "sales_persons"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20))
    joining_date = db.Column(db.Date, default=date.today)
    status = db.Column(db.String(20), default="Active")
    monthly_target = db.Column(db.Float, default=0.0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    allocations = db.relationship("ProductAllocation", back_populates="sales_person", lazy="dynamic")
    sales = db.relationship("Sale", back_populates="sales_person", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "phone": self.phone,
            "joining_date": self.joining_date.isoformat() if self.joining_date else None,
            "status": self.status,
            "monthly_target": self.monthly_target,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Product(db.Model):
    __tablename__ = "products"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(150), nullable=False)
    price = db.Column(db.Float, nullable=False)
    unit = db.Column(db.String(30), default="pcs")
    description = db.Column(db.Text)
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    allocations = db.relationship("ProductAllocation", back_populates="product", lazy="dynamic")
    sales = db.relationship("Sale", back_populates="product", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "price": self.price,
            "unit": self.unit,
            "description": self.description,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ProductAllocation(db.Model):
    __tablename__ = "product_allocations"

    id = db.Column(db.Integer, primary_key=True)
    sales_person_id = db.Column(db.Integer, db.ForeignKey("sales_persons.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity = db.Column(db.Float, nullable=False)
    allocation_date = db.Column(db.Date, default=date.today)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sales_person = db.relationship("SalesPerson", back_populates="allocations")
    product = db.relationship("Product", back_populates="allocations")

    def to_dict(self):
        return {
            "id": self.id,
            "sales_person_id": self.sales_person_id,
            "sales_person_name": self.sales_person.name if self.sales_person else None,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else None,
            "quantity": self.quantity,
            "allocation_date": self.allocation_date.isoformat() if self.allocation_date else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class Sale(db.Model):
    __tablename__ = "sales"

    id = db.Column(db.Integer, primary_key=True)
    sales_person_id = db.Column(db.Integer, db.ForeignKey("sales_persons.id"), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey("products.id"), nullable=False)
    quantity_sold = db.Column(db.Float, nullable=False)
    amount_received = db.Column(db.Float, nullable=False)
    sale_date = db.Column(db.Date, default=date.today)
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    sales_person = db.relationship("SalesPerson", back_populates="sales")
    product = db.relationship("Product", back_populates="sales")

    def to_dict(self):
        return {
            "id": self.id,
            "sales_person_id": self.sales_person_id,
            "sales_person_name": self.sales_person.name if self.sales_person else None,
            "product_id": self.product_id,
            "product_name": self.product.name if self.product else None,
            "quantity_sold": self.quantity_sold,
            "amount_received": self.amount_received,
            "sale_date": self.sale_date.isoformat() if self.sale_date else None,
            "notes": self.notes,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ExpenseCategory(db.Model):
    __tablename__ = "expense_categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    type = db.Column(db.String(50))
    description = db.Column(db.Text)

    expenses = db.relationship("Expense", back_populates="category", lazy="dynamic")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "description": self.description,
        }


class Expense(db.Model):
    __tablename__ = "expenses"

    id = db.Column(db.Integer, primary_key=True)
    category_id = db.Column(db.Integer, db.ForeignKey("expense_categories.id"), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    expense_date = db.Column(db.Date, default=date.today)
    description = db.Column(db.Text)
    payment_mode = db.Column(db.String(30), default="Cash")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    category = db.relationship("ExpenseCategory", back_populates="expenses")

    def to_dict(self):
        return {
            "id": self.id,
            "category_id": self.category_id,
            "category_name": self.category.name if self.category else None,
            "category_type": self.category.type if self.category else None,
            "amount": self.amount,
            "expense_date": self.expense_date.isoformat() if self.expense_date else None,
            "description": self.description,
            "payment_mode": self.payment_mode,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default="Admin")
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "role": self.role,
        }