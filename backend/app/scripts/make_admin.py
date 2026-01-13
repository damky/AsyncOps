"""
Script to make an existing user an admin.
Usage: python -m app.scripts.make_admin <email>
"""
import sys
from app.db.session import SessionLocal
from app.db.models.user import User

def make_admin(email: str):
    """Make an existing user an admin."""
    db = SessionLocal()
    
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User with email {email} not found")
            sys.exit(1)
        
        if user.role == "admin":
            print(f"User {email} is already an admin")
            sys.exit(0)
        
        user.role = "admin"
        db.commit()
        print(f"User {email} is now an admin!")
        
    except Exception as e:
        db.rollback()
        print(f"Error updating user: {e}")
        sys.exit(1)
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python -m app.scripts.make_admin <email>")
        sys.exit(1)
    
    email = sys.argv[1].strip()
    make_admin(email)
