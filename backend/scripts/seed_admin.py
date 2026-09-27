from app.database.database import SessionLocal
from app.models.user import User
from app.core.security import hash_password
from app.core.roles import UserRole


def seed_user(db, email, full_name, password, role):
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        print(f"✅ {role} already exists: {email}")
        return

    user = User(
        full_name=full_name,
        email=email,
        password_hash=hash_password(password),
        role=role,
        is_active=True,
        must_change_password=True,
    )
    db.add(user)
    db.commit()
    print(f"✅ {role} created: {email}")


def seed_admin():
    db = SessionLocal()

    try:
        seed_user(
            db,
            email="eswar@cdac.in",
            full_name="Eswar",
            password="eswar123",
            role=UserRole.ADMIN.value,
        )
        seed_user(
            db,
            email="auditor@cdac.in",
            full_name="Auditor",
            password="Auditor@123",
            role=UserRole.AUDITOR.value,
        )
    finally:
        db.close()


if __name__ == "__main__":
    seed_admin()