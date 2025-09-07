"""
FastAPI application entrypoint
"""
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.sessions import SessionMiddleware

from app.config import settings
from app.db import init_db
from app.api.v1 import api_router as v1_router
from app.api.v2 import api_router as v2_router
from app.admin import create_admin_panel
from app.utils.admin_safety import ensure_super_admin_exists


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan context manager
    """
    # Startup
    print("🚀 Starting up HackOdisha Backend...")
    
    # Initialize database
    init_db()
    print("✅ Database initialized")
    
    # Ensure at least one super admin exists
    print("🔐 Checking admin safety...")
    ensure_super_admin_exists()
    print("✅ Admin safety verified")
    
    yield
    
    # Shutdown
    print("🛑 Shutting down HackOdisha Backend...")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Backend API for HackOdisha project with user management system",
    version=settings.VERSION,
    docs_url="/docs",  # Always enable docs
    redoc_url="/redoc",  # Always enable redoc
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_HOSTS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add session middleware for admin panel
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.ADMIN_SECRET_KEY,
    max_age=3600,  # 1 hour
)

# Add trusted host middleware for production
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS,
    )

# Include API routes
app.include_router(v1_router)  # Admin API routes
app.include_router(v2_router)  # Frontend API routes

# Create admin panel
admin_panel = create_admin_panel(app)

# Add a welcome dashboard route for admin panel
@app.get("/admin/dashboard")
async def admin_dashboard(request: Request):
    """Admin dashboard with statistics"""
    from starlette.responses import HTMLResponse
    from sqlmodel import Session, select
    from app.models import User, Admin
    from app.db import engine
    
    # Check if user is authenticated admin
    if not request.session.get("token"):
        from starlette.responses import RedirectResponse
        return RedirectResponse(url="/admin/login", status_code=302)
    
    username = request.session.get("username", "Admin")
    role = request.session.get("role", "admin")
    
    # Get statistics from database
    with Session(engine) as session:
        # User statistics
        total_users = len(session.exec(select(User)).all())
        active_users = len(session.exec(
            select(User).where(User.is_active == True, User.is_blocked == False)
        ).all())
        approved_users = len(session.exec(
            select(User).where(User.is_approved == True)
        ).all())
        pending_users = len(session.exec(
            select(User).where(User.is_approved == False, User.is_blocked == False)
        ).all())
        
        # Admin statistics
        total_admins = len(session.exec(select(Admin)).all())
        super_admins = len(session.exec(
            select(Admin).where(Admin.role == "super_admin", Admin.is_active == True)
        ).all())
    
    dashboard_html = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <title>HackOdisha Admin Dashboard</title>
        <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/css/bootstrap.min.css" rel="stylesheet">
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            body {{ background-color: #f8f9fa; }}
            .dashboard-card {{ 
                border-radius: 15px; 
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                transition: transform 0.2s;
            }}
            .dashboard-card:hover {{ transform: translateY(-2px); }}
            .stat-icon {{ font-size: 2.5rem; opacity: 0.7; }}
            .welcome-section {{ 
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-radius: 15px;
                padding: 2rem;
                margin-bottom: 2rem;
            }}
        </style>
    </head>
    <body>
        <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
            <div class="container-fluid">
                <a class="navbar-brand" href="/admin"><i class="fas fa-shield-alt me-2"></i>HackOdisha Admin</a>
                <div class="navbar-nav ms-auto">
                    <a class="nav-link" href="/admin"><i class="fas fa-home me-1"></i>Admin Panel</a>
                    <a class="nav-link" href="/admin/logout"><i class="fas fa-sign-out-alt me-1"></i>Logout</a>
                </div>
            </div>
        </nav>
        
        <div class="container-fluid py-4">
            <!-- Welcome Section -->
            <div class="welcome-section text-center">
                <h1><i class="fas fa-tachometer-alt me-3"></i>Welcome to HackOdisha Admin Dashboard, {username}!</h1>
                <p class="lead mb-0">You are logged in as: <strong>{role.replace('_', ' ').title()}</strong></p>
            </div>
            
            <!-- Statistics Cards -->
            <div class="row mb-4">
                <div class="col-md-3 mb-3">
                    <div class="card dashboard-card h-100 border-0">
                        <div class="card-body text-center">
                            <i class="fas fa-users stat-icon text-primary"></i>
                            <h3 class="mt-2">{total_users}</h3>
                            <p class="text-muted">Total Users</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card dashboard-card h-100 border-0">
                        <div class="card-body text-center">
                            <i class="fas fa-check-circle stat-icon text-success"></i>
                            <h3 class="mt-2">{approved_users}</h3>
                            <p class="text-muted">Approved Users</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card dashboard-card h-100 border-0">
                        <div class="card-body text-center">
                            <i class="fas fa-clock stat-icon text-warning"></i>
                            <h3 class="mt-2">{pending_users}</h3>
                            <p class="text-muted">Pending Approval</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 mb-3">
                    <div class="card dashboard-card h-100 border-0">
                        <div class="card-body text-center">
                            <i class="fas fa-user-shield stat-icon text-info"></i>
                            <h3 class="mt-2">{total_admins}</h3>
                            <p class="text-muted">Total Admins</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Quick Actions -->
            <div class="row mb-4">
                <div class="col-12">
                    <div class="card dashboard-card border-0">
                        <div class="card-header bg-white">
                            <h5 class="mb-0"><i class="fas fa-bolt me-2"></i>Quick Actions</h5>
                        </div>
                        <div class="card-body">
                            <div class="row">
                                <div class="col-md-3 mb-2">
                                    <a href="/admin/user/list" class="btn btn-outline-primary w-100">
                                        <i class="fa-users me-2"></i>Manage Users
                                    </a>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <a href="/admin/admin/list" class="btn btn-outline-primary w-100">
                                        <i class="fa-user-shield me-2"></i>Manage Admins
                                    </a>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <a href="/admin/user/list" class="btn btn-outline-warning w-100">
                                        <i class="fa-check-circle me-2"></i>Approve Users
                                    </a>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <a href="/docs" class="btn btn-outline-info w-100">
                                        <i class="fa-book me-2"></i>API Documentation
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- System Info -->
            <div class="row">
                <div class="col-md-6">
                    <div class="card dashboard-card border-0">
                        <div class="card-header bg-white">
                            <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>System Status</h5>
                        </div>
                        <div class="card-body">
                            <div class="alert alert-success">
                                <i class="fas fa-check-circle me-2"></i>
                                <strong>System Operational</strong><br>
                                All services are running normally.
                            </div>
                            <p><strong>Active Features:</strong></p>
                            <ul class="list-unstyled">
                                <li><i class="fas fa-check text-success me-2"></i>User Management</li>
                                <li><i class="fas fa-check text-success me-2"></i>Admin Panel</li>
                                <li><i class="fas fa-check text-success me-2"></i>User Approval System</li>
                                <li><i class="fas fa-check text-success me-2"></i>V2 API for Frontend</li>
                            </ul>
                        </div>
                    </div>
                </div>
                <div class="col-md-6">
                    <div class="card dashboard-card border-0">
                        <div class="card-header bg-white">
                            <h5 class="mb-0"><i class="fas fa-link me-2"></i>Quick Links</h5>
                        </div>
                        <div class="card-body">
                            <div class="list-group list-group-flush">
                                <a href="/admin" class="list-group-item list-group-item-action">
                                    <i class="fas fa-home me-2"></i>Admin Panel Home
                                </a>
                                <a href="/docs" class="list-group-item list-group-item-action">
                                    <i class="fas fa-book me-2"></i>API Documentation
                                </a>
                                <a href="/" class="list-group-item list-group-item-action">
                                    <i class="fas fa-globe me-2"></i>Main Application
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.1.3/dist/js/bootstrap.bundle.min.js"></script>
    </body>
    </html>
    """
    
    return HTMLResponse(dashboard_html)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """
    Global exception handler for unhandled exceptions
    """
    if settings.DEBUG:
        # In debug mode, show full error details
        return JSONResponse(
            status_code=500,
            content={
                "detail": "Internal server error",
                "error": str(exc),
                "type": type(exc).__name__,
            },
        )
    else:
        # In production, hide error details
        return JSONResponse(
            status_code=500,
            content={"detail": "Internal server error"},
        )


# Health check endpoint
@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    """
    return {
        "status": "healthy",
        "app_name": settings.APP_NAME,
        "version": settings.VERSION,
    }


# Root endpoint
@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint with API information
    """
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs_url": "/docs",
        "admin_panel_url": "/admin",
        "api_base_url": "/api/v1",
        "endpoints": {
            "v1": {
                "auth": "/api/v1/auth",
                "users": "/api/v1/users", 
                "admins": "/api/v1/admins",
                "description": "Admin API routes"
            },
            "v2": {
                "auth": "/api/v2/auth",
                "description": "Frontend authentication API routes only"
            }
        },
    }


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level="info",
    )
