import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.core.roles import UserRole

def create_admin_account(email, full_name, password):
    db = SessionLocal()
    try:
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            existing.password_hash = hash_password(password)
            existing.role = UserRole.ADMIN.value
            existing.is_active = True
            db.commit()
            print(f"[OK] Existing account updated to Admin: {email}")
        else:
            user = User(
                full_name=full_name,
                email=email,
                password_hash=hash_password(password),
                role=UserRole.ADMIN.value,
                is_active=True,
                must_change_password=False,
            )
            db.add(user)
            db.commit()
            print(f"[OK] New Admin account created: {email}")
    finally:
        db.close()

if __name__ == "__main__":
    create_admin_account("admin@redline.sec", "REDLINE System Administrator", "RedlineAdmin#2026")
    create_admin_account("eswar@cdac.in", "Eswar", "eswar123")
