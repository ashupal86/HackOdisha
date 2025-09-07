"""
Admin safety utilities to ensure system always has at least one super admin
"""
from sqlmodel import Session, select
from app.models import Admin
from app.core.security import hash_password
from app.db import engine
import datetime
import uuid


def count_active_super_admins(session: Session) -> int:
    """
    Count the number of active super admins
    
    Args:
        session: Database session
        
    Returns:
        Number of active super admins
    """
    query = select(Admin).where(
        Admin.role == "super_admin",
        Admin.is_active == True
    )
    super_admins = session.exec(query).all()
    return len(super_admins)


def count_total_admins(session: Session) -> int:
    """
    Count the total number of active admins (including super admins)
    
    Args:
        session: Database session
        
    Returns:
        Number of active admins
    """
    query = select(Admin).where(Admin.is_active == True)
    admins = session.exec(query).all()
    return len(admins)


def create_default_super_admin(session: Session) -> Admin:
    """
    Create a default super admin when none exist
    
    Args:
        session: Database session
        
    Returns:
        Created super admin instance
    """
    default_admin = Admin(
        id=uuid.uuid4(),
        username="superadmin",
        email="superadmin@hackodisha.com",
        password_hash=hash_password("admin123"),
        role="super_admin",
        is_active=True,
        password_changed=False,  # Force password change on first login
        created_at=datetime.datetime.utcnow()
    )
    
    session.add(default_admin)
    session.commit()
    session.refresh(default_admin)
    
    print(f"🔧 Created default super admin: {default_admin.username}")
    print(f"📧 Email: {default_admin.email}")
    print(f"🔑 Default password: admin123 (must be changed on first login)")
    
    return default_admin


def ensure_super_admin_exists(session: Session = None) -> bool:
    """
    Ensure at least one super admin exists in the system
    
    Args:
        session: Optional database session (creates new one if not provided)
        
    Returns:
        True if super admin exists or was created, False on error
    """
    if session is None:
        with Session(engine) as session:
            return ensure_super_admin_exists(session)
    
    try:
        # Check if any super admins exist
        super_admin_count = count_active_super_admins(session)
        
        if super_admin_count == 0:
            print("⚠️  No active super admins found! Creating default super admin...")
            create_default_super_admin(session)
            return True
        else:
            print(f"✅ Found {super_admin_count} active super admin(s)")
            return True
            
    except Exception as e:
        print(f"❌ Error ensuring super admin exists: {e}")
        return False


def can_delete_admin(session: Session, admin_id: uuid.UUID) -> tuple[bool, str]:
    """
    Check if an admin can be safely deleted
    
    Args:
        session: Database session
        admin_id: ID of admin to delete
        
    Returns:
        Tuple of (can_delete: bool, reason: str)
    """
    admin = session.get(Admin, admin_id)
    if not admin:
        return False, "Admin not found"
    
    if not admin.is_active:
        return False, "Admin is already inactive"
    
    # If this is a super admin, check if they're the last one
    if admin.role == "super_admin":
        super_admin_count = count_active_super_admins(session)
        if super_admin_count <= 1:
            return False, "Cannot delete the last super admin - system must have at least one super admin"
    
    return True, "Admin can be safely deleted"


def get_admin_safety_status(session: Session = None) -> dict:
    """
    Get current admin safety status
    
    Args:
        session: Optional database session
        
    Returns:
        Dictionary with safety status information
    """
    if session is None:
        with Session(engine) as session:
            return get_admin_safety_status(session)
    
    total_admins = count_total_admins(session)
    super_admin_count = count_active_super_admins(session)
    
    # Get the first super admin for reference
    query = select(Admin).where(
        Admin.role == "super_admin",
        Admin.is_active == True
    ).limit(1)
    first_super_admin = session.exec(query).first()
    
    return {
        "total_active_admins": total_admins,
        "active_super_admins": super_admin_count,
        "system_safe": super_admin_count >= 1,
        "default_super_admin_exists": first_super_admin.username == "superadmin" if first_super_admin else False,
        "first_super_admin": {
            "username": first_super_admin.username,
            "email": first_super_admin.email,
            "password_changed": first_super_admin.password_changed
        } if first_super_admin else None
    }
