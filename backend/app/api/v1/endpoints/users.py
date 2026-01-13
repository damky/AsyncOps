from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from app.core.dependencies import get_db, get_current_user, get_current_active_admin
from app.db.models.user import User
from app.schemas.user import UserResponse, UserUpdate, PasswordChange

router = APIRouter()


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile."""
    return current_user


@router.patch("/me", response_model=UserResponse)
async def update_current_user_profile(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile."""
    # Update allowed fields
    if user_update.full_name is not None:
        current_user.full_name = user_update.full_name
    
    if user_update.email is not None and user_update.email != current_user.email:
        # Check if email is already taken
        existing_user = db.query(User).filter(User.email == user_update.email).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Email already registered"
            )
        current_user.email = user_update.email
    
    db.commit()
    db.refresh(current_user)
    return current_user


@router.post("/me/change-password")
async def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password."""
    from app.core.security import verify_password, get_password_hash
    
    # Verify current password
    if not verify_password(password_data.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect"
        )
    
    # Update password
    current_user.password_hash = get_password_hash(password_data.new_password)
    db.commit()
    
    return {"message": "Password changed successfully"}


@router.get("/for-assignment", response_model=List[UserResponse])
async def get_users_for_assignment(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get list of active users for assignment purposes (any authenticated user)."""
    users = db.query(User).filter(User.is_active == True).order_by(User.full_name).all()
    return users


@router.get("", response_model=List[UserResponse])
async def list_users(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    role: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    current_user: User = Depends(get_current_active_admin),
    db: Session = Depends(get_db)
):
    """List all users (admin only)."""
    query = db.query(User)
    
    # Filter by role if provided
    if role:
        query = query.filter(User.role == role)
    
    # Search by name or email
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (User.full_name.ilike(search_term)) | (User.email.ilike(search_term))
        )
    
    # Pagination
    total = query.count()
    users = query.offset((page - 1) * limit).limit(limit).all()
    
    return users
