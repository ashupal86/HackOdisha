"""
SQLAdmin setup for admin panel
"""
import datetime
from sqladmin import Admin as SQLAdmin, ModelView, BaseView
from sqladmin.authentication import AuthenticationBackend
from starlette.requests import Request
from starlette.responses import RedirectResponse
from starlette.templating import Jinja2Templates

from app.models import User, Admin
from app.core.security import verify_password
from app.core.jwt_handler import create_token_for_user, verify_token
from app.config import settings
from app.db import engine

from sqlmodel import Session, select


class AdminAuthBackend(AuthenticationBackend):
    """
    Authentication backend for SQLAdmin panel
    Only Admin table accounts can login
    """
    
    async def login(self, request: Request) -> bool:
        form = await request.form()
        username, password = form["username"], form["password"]
        
        with Session(engine) as session:
            admin = session.exec(
                select(Admin).where(Admin.username == username)
            ).first()
            
            if admin and verify_password(password, admin.password_hash):
                if admin.is_active:
                    # Update last login
                    admin.last_login = datetime.datetime.utcnow()
                    session.add(admin)
                    session.commit()
                    
                    # Create token and store in session
                    token = create_token_for_user(
                        user_id=admin.id,
                        username=admin.username,
                        role=admin.role,
                    )
                    request.session.update({
                        "token": token,
                        "user_id": str(admin.id),
                        "username": admin.username,
                        "role": admin.role,
                        "password_changed": admin.password_changed,
                    })
                    return True
        
        return False
    
    async def logout(self, request: Request) -> bool:
        request.session.clear()
        return True
    
    async def authenticate(self, request: Request) -> bool:
        token = request.session.get("token")
        if not token:
            return False
        
        token_data = verify_token(token)
        if not token_data:
            return False
        
        # Verify admin still exists and is active
        with Session(engine) as session:
            admin = session.get(Admin, token_data.user_id)
            if admin and admin.is_active:
                return True
        
        return False


# Create authentication backend
authentication_backend = AdminAuthBackend(secret_key=settings.ADMIN_SECRET_KEY)


class UserAdmin(ModelView, model=User):
    """Admin interface for User model"""
    column_list = [
        User.id,
        User.username,
        User.email,
        User.is_approved,
        User.is_active,
        User.is_blocked,
        User.blocked_at,
        User.created_at,
    ]
    column_searchable_list = [User.username, User.email]
    column_sortable_list = [
        User.username,
        User.email,
        User.created_at,
    ]
    column_default_sort = [(User.created_at, True)]
    
    can_create = True  # Enable user creation in admin panel
    can_edit = True
    can_delete = True  # Allow deletion for super admins
    can_view_details = True
    
    # Exclude sensitive fields from forms
    form_excluded_columns = [
        User.password_hash, 
        User.id, 
        User.created_at, 
        User.updated_at,
        User.blocked_at,  # Managed automatically when blocking
    ]
    
    # Add password field for user creation
    form_extra_fields = {
        "password": {
            "type": "password",
            "label": "Password",
            "required": True,
            "help_text": "Enter password for the user (will be automatically hashed, min 8 characters)"
        }
    }
    
    # Custom labels
    column_labels = {
        User.id: "ID",
        User.username: "Username",
        User.email: "Email",
        User.is_approved: "Approved",
        User.is_active: "Active",
        User.is_blocked: "Blocked",
        User.blocked_at: "Blocked At",
        User.blocked_reason: "Block Reason",
        User.created_at: "Created At",
        User.updated_at: "Updated At",
    }
    
    # Default values for new users
    form_create_defaults = {
        "is_approved": False,
        "is_active": True,
        "is_blocked": False
    }
    
    async def on_model_change(self, data, model, is_created, request):
        """Handle model changes - hash password for new users, check duplicates, and handle blocking logic"""
        if is_created:
            from app.utils.exceptions import check_duplicate_user_fields, DuplicateValueError
            
            try:
                # Check for duplicates before creating
                with Session(engine) as session:
                    check_duplicate_user_fields(
                        session,
                        username=model.username,
                        email=model.email
                    )
                
                # Handle password for new users created by admin
                if 'password' in data and data['password']:
                    # Admin is creating user - hash the password properly
                    from app.core.security import hash_password
                    model.password_hash = hash_password(data['password'])
                else:
                    # Set default password for new users created by admin
                    from app.core.security import hash_password
                    default_password = "TempPass123!"
                    model.password_hash = hash_password(default_password)
                
            except DuplicateValueError as e:
                from starlette.responses import RedirectResponse
                from urllib.parse import quote
                # Redirect with error message
                error_msg = quote(f"Error: {e.message}")
                return RedirectResponse(
                    url=f"/user/create?error={error_msg}",
                    status_code=302
                )
        else:
            # Handle blocking logic for existing users
            if hasattr(model, 'is_blocked') and model.is_blocked:
                # If user is being blocked, use the model method
                if not getattr(model, '_was_blocked', False):
                    model.block_user(reason=getattr(model, 'blocked_reason', 'Blocked via admin panel'))
            elif hasattr(model, 'is_blocked') and not model.is_blocked:
                # If user is being unblocked, use the model method
                if getattr(model, '_was_blocked', True):
                    model.unblock_user()
        
        return await super().on_model_change(data, model, is_created, request)
    
    def can_delete_model(self, request: Request, model: User) -> bool:
        """
        Control deletion permissions for user records
        
        Only super admins can delete users
        """
        user_role = request.session.get("role", "")
        return user_role == "super_admin"
    
    async def on_model_delete(self, model: User, request: Request) -> None:
        """
        Handle user deletion - perform soft delete by default
        """
        # Override to perform soft delete instead of hard delete
        with Session(engine) as session:
            user = session.get(User, model.id)
            if user:
                user.is_active = False
                user.updated_at = datetime.datetime.utcnow()
                session.add(user)
                session.commit()
        
        return await super().on_model_delete(model, request)
    
    def is_accessible(self, request: Request) -> bool:
        """Admins and super admins can manage users"""
        user_role = request.session.get("role", "")
        return user_role in ["admin", "super_admin"]


class AdminAdmin(ModelView, model=Admin):
    """Admin interface for Admin model"""
    column_list = [
        Admin.id,
        Admin.username,
        Admin.email,
        Admin.role,
        Admin.is_active,
        Admin.created_at,
        Admin.last_login,
    ]
    column_searchable_list = [Admin.username, Admin.email]
    column_sortable_list = [
        Admin.username,
        Admin.email,
        Admin.role,
        Admin.created_at,
        Admin.last_login,
    ]
    column_default_sort = [(Admin.created_at, True)]
    
    can_create = True
    can_edit = True
    can_delete = True  # Allow deletion for super_admins
    can_view_details = True
    
    # Exclude sensitive fields from forms (but allow password input)
    form_excluded_columns = [
        Admin.password_hash,
        Admin.password_changed,  # Managed automatically
        Admin.id,
        Admin.created_at,
        Admin.updated_at,
        Admin.last_login,
    ]
    
    # Custom labels
    column_labels = {
        Admin.id: "ID",
        Admin.username: "Username",
        Admin.email: "Email",
        Admin.role: "Role",
        Admin.is_active: "Active",
        Admin.created_at: "Created At",
        Admin.updated_at: "Updated At",
        Admin.last_login: "Last Login",
    }
    
    # Form fields configuration with dropdowns
    form_choices = {
        "role": [
            ("admin", "Admin - User Management"),
            ("super_admin", "Super Admin - Full Access")
        ]
    }
    
    # Default values for new admins
    form_create_defaults = {
        "role": "admin",
        "is_active": True
    }
    
    async def on_model_change(self, data, model, is_created, request):
        """Handle model changes - set default password for new admins and check duplicates"""
        if is_created:
            from app.core.security import hash_password
            from app.utils.exceptions import check_duplicate_admin_fields, DuplicateValueError
            from app.utils.admin_safety import can_delete_admin
            
            try:
                # Check for duplicates before creating
                with Session(engine) as session:
                    check_duplicate_admin_fields(
                        session,
                        username=model.username,
                        email=model.email
                    )
                
                # Set default password that must be changed on first login
                default_password = "admin123"
                model.password_hash = hash_password(default_password)
                model.password_changed = False  # Force password change on first login
                
            except DuplicateValueError as e:
                from starlette.responses import RedirectResponse
                from urllib.parse import quote
                # Redirect with error message
                error_msg = quote(f"Error: {e.message}")
                return RedirectResponse(
                    url=f"/admin/create?error={error_msg}",
                    status_code=302
                )
        
        return await super().on_model_change(data, model, is_created, request)
    
    def can_delete_model(self, request: Request, model: Admin) -> bool:
        """
        Control deletion permissions for admin records
        
        Super admins can delete other admins but not themselves or the last super admin
        """
        user_role = request.session.get("role", "")
        current_user_id = request.session.get("user_id", "")
        
        # Only super_admins can delete
        if user_role != "super_admin":
            return False
        
        # Prevent self-deletion
        if str(model.id) == current_user_id:
            return False
        
        # Use safety check to prevent deleting last super admin
        with Session(engine) as session:
            can_delete, _ = can_delete_admin(session, model.id)
            return can_delete
    
    async def on_model_delete(self, model: Admin, request: Request) -> None:
        """
        Handle admin deletion - perform soft delete by default
        """
        # Override to perform soft delete instead of hard delete
        with Session(engine) as session:
            admin = session.get(Admin, model.id)
            if admin:
                admin.is_active = False
                admin.updated_at = datetime.datetime.utcnow()
                session.add(admin)
                session.commit()
        
        return await super().on_model_delete(model, request)
    
    def is_accessible(self, request: Request) -> bool:
        """Only super_admins can manage other admins"""
        user_role = request.session.get("role", "")
        return user_role == "super_admin"




def create_admin_panel(app):
    """
    Create and configure SQLAdmin panel
    
    Args:
        app: FastAPI application instance
        
    Returns:
        SQLAdmin instance
    """
    admin = SQLAdmin(
        app,
        engine,
        authentication_backend=authentication_backend,
        title="HackOdisha Admin Panel",
        logo_url=None,  # Add your logo URL here if needed
    )
    
    # Add model views
    admin.add_view(UserAdmin)
    admin.add_view(AdminAdmin)
    
    return admin
