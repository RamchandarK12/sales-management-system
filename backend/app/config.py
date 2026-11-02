import os
from dotenv import load_dotenv

load_dotenv()

db_url = os.getenv(
    "DATABASE_URL",
    "postgresql://postgres:password@localhost:5432/sales_db"
)

# Render sometimes gives postgres://
if db_url.startswith("postgres://"):
    db_url = db_url.replace("postgres://", "postgresql://", 1)

# Force psycopg2 driver (stable)
if db_url.startswith("postgresql://") and "+psycopg" not in db_url:
    db_url = db_url.replace("postgresql://", "postgresql+psycopg2://", 1)

class Config:
    SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret-key")
    SQLALCHEMY_DATABASE_URI = db_url
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_EXPIRATION_HOURS = 24
    RESET_CODE = os.getenv("RESET_CODE", "123456")