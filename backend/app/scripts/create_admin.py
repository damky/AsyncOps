"""
Script to create an initial admin user.
Usage: python -m app.scripts.create_admin
"""
import sys
from app.db.session import SessionLocal
from app.db.models.user import User
from app.core.security import get_password_hash

def create_admin():
    """Create an admin user interactively."""
    db = SessionLocal()
    
    try:
        email = input("Enter admin email: ").strip()
        if not email:
            print("Email is required")
            sys.exit(1)
        
        password = input("Enter admin password: ").strip()
        if not password:
            print("Password is required")
            sys.exit(1)
        
        full_name = input("Enter admin full name: ").strip()
        if not full_name:
            print("Full name is required")
            sys.exit(1)
        
        # Check if user already exists
        existing = db.query(User).filter(User.email == email).first()
        if existing:
            print(f"User with email {email} already exists")
            sys.exit(1)
        
        # Create admin user
        admin = User(
            email=email,
            password_hash=get_password_hash(password),
            full_name=full_name,
            role="admin"
        )
        
        db.add(admin)
        db.commit()
        print(f"Admin user {email} created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating admin user: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    create_admin()
