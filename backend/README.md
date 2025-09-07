# HackOdisha Backend

A comprehensive FastAPI backend application with JWT authentication, role-based access control (RBAC), and SQLAdmin panel.

### Backend is Hosted on [Backend Link](https://hackodisha-backend-1d748d543390.herokuapp.com/)

## 🚀 Features

- **FastAPI Framework**: Modern, fast, and type-safe Python web framework
- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: User roles (user, merchant, distributor) and admin roles (admin, super_admin)
- **PostgreSQL Database**: Robust relational database with SQLModel ORM
- **Admin Panel**: SQLAdmin interface for managing users and admins
- **Docker Support**: Containerized application with Docker Compose
- **Database Migrations**: Alembic for version-controlled database schema changes
- **Comprehensive Testing**: Unit and integration tests with pytest
- **API Documentation**: Automatic OpenAPI/Swagger documentation

## 📂 Project Structure

```
backend/
├── alembic/                      # Database migrations
│   ├── versions/                 # Auto-generated migration scripts
│   └── env.py
├── app/
│   ├── __init__.py
│   ├── main.py                   # FastAPI app entrypoint
│   ├── config.py                 # App configuration
│   ├── db.py                     # Database setup
│   ├── admin.py                  # SQLAdmin panel setup
│   ├── models/                   # SQLModel ORM models
│   │   ├── __init__.py
│   │   ├── user.py               # User model
│   │   └── admin.py              # Admin model
│   ├── schemas/                  # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── user.py
│   │   ├── admin.py
│   │   └── auth.py
│   ├── core/                     # Core utilities
│   │   ├── __init__.py
│   │   ├── security.py           # Password hashing
│   │   ├── jwt_handler.py        # JWT operations
│   │   └── dependencies.py       # FastAPI dependencies
│   ├── api/                      # API routes
│   │   ├── __init__.py
│   │   └── v1/                   # API v1
│   │       ├── __init__.py
│   │       ├── auth.py           # Authentication routes
│   │       ├── users.py          # User management routes
│   │       └── admins.py         # Admin management routes
│   └── utils/                    # Additional utilities
│       ├── __init__.py
│       └── hashing.py
├── tests/                        # Test suite
│   ├── __init__.py
│   ├── test_auth.py
│   ├── test_users.py
│   └── test_admins.py
├── Dockerfile                    # FastAPI container
├── docker-compose.yml            # PostgreSQL + FastAPI services
├── pyproject.toml                # Dependencies and project config
├── alembic.ini                   # Alembic configuration
└── README.md
```

## 🛠️ Installation & Setup

### Prerequisites

- Python 3.11+
- Docker and Docker Compose
- Poetry (optional, for local development)

### Option 1: Docker Compose (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd HackOdisha/backend
   ```

2. **Start the services**
   ```bash
   docker-compose up -d
   ```

3. **Create initial database migration**
   ```bash
   docker-compose exec app alembic revision --autogenerate -m "Initial migration"
   docker-compose exec app alembic upgrade head
   ```

4. **Create a super admin user** (Run inside the container)
   ```bash
   docker-compose exec app python -c "
   from app.db import get_session
   from app.models import Admin
   from app.core.security import hash_password
   from sqlmodel import Session
   from app.db import engine

   with Session(engine) as session:
       admin = Admin(
           username='superadmin',
           email='admin@example.com',
           password_hash=hash_password('admin123'),
           role='super_admin'
       )
       session.add(admin)
       session.commit()
       print('Super admin created: superadmin / admin123')
   "
   ```

### Option 2: Local Development

1. **Install dependencies**
   ```bash
   pip install poetry
   poetry install
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start PostgreSQL**
   ```bash
   docker-compose up -d db
   ```

4. **Run migrations**
   ```bash
   poetry run alembic upgrade head
   ```

5. **Start the development server**
   ```bash
   poetry run uvicorn app.main:app --reload
   ```

## 🔗 API Endpoints

### Base URL
- Development: `http://localhost:8000`
- API Base: `/api/v1`

### Authentication Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/api/v1/auth/register` | Register new user | Public |
| POST | `/api/v1/auth/login` | Login user/admin | Public |
| GET | `/api/v1/auth/me` | Get current user info | Authenticated |

### User Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/v1/users/` | List all users | Admin |
| GET | `/api/v1/users/{id}` | Get user by ID | Admin |
| PATCH | `/api/v1/users/{id}/approve` | Approve/reject user | Admin |
| DELETE | `/api/v1/users/{id}` | Deactivate user | Admin |

### Admin Management Endpoints

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/api/v1/admins/` | List all admins | Super Admin |
| GET | `/api/v1/admins/{id}` | Get admin by ID | Super Admin |
| POST | `/api/v1/admins/` | Create new admin | Super Admin |
| PATCH | `/api/v1/admins/{id}/role` | Update admin role | Super Admin |
| DELETE | `/api/v1/admins/{id}` | Deactivate admin | Super Admin |

## 👑 Admin Panel

Access the admin panel at: `http://localhost:8000/admin`

### Features:
- **User Management**: View, edit, approve users
- **Admin Management**: Create and manage admin accounts (super_admin only)
- **Role-Based Access**: Different permissions based on admin role

### Login Credentials:
- Username: `superadmin`
- Password: `admin123`

## 🔐 Authentication & Authorization

### User Management:
Users no longer have roles - they are managed through approval status and activity states.

### Admin Roles:
- **admin**: Can manage users
- **super_admin**: Can manage users and admins

### JWT Token:
- Algorithm: HS256
- Expiration: 30 minutes (configurable)
- Contains: user_id, username

## 🗄️ Database Models

### User Model
```python
class User(SQLModel, table=True):
    id: uuid.UUID (Primary Key)
    username: str (Unique)
    email: str (Unique)
    password_hash: str
    is_approved: bool (default: False)
    is_active: bool (default: True)
    created_at: datetime
    updated_at: Optional[datetime]
```

### Admin Model
```python
class Admin(SQLModel, table=True):
    id: uuid.UUID (Primary Key)
    username: str (Unique)
    email: str (Unique)
    password_hash: str
    role: str (default: "admin")
    is_active: bool (default: True)
    created_at: datetime
    updated_at: Optional[datetime]
    last_login: Optional[datetime]
```

## 🧪 Testing

Run the test suite:

```bash
# Using Docker
docker-compose exec app pytest

# Using Poetry (local)
poetry run pytest

# With coverage
poetry run pytest --cov=app
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
# Database
DATABASE_URL=postgresql://admin:admin123@localhost:5432/app_db

# JWT
JWT_SECRET_KEY=your-super-secret-jwt-key-change-in-production
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# App
APP_NAME=HackOdisha Backend
DEBUG=false
VERSION=1.0.0

# Admin Panel
ADMIN_SECRET_KEY=your-admin-secret-key-change-in-production

# CORS
ALLOWED_HOSTS=["*"]
```

### Database Migration

Create and apply migrations:

```bash
# Generate migration
alembic revision --autogenerate -m "Description of changes"

# Apply migrations
alembic upgrade head

# Downgrade
alembic downgrade -1
```

## 📚 API Documentation

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔄 Development Workflow

1. **Make changes** to the code
2. **Create tests** for new features
3. **Run tests** to ensure nothing breaks
4. **Generate migrations** if models changed
5. **Update documentation** as needed

## 🚨 Security Considerations

- Change default JWT secrets in production
- Use strong passwords for database and admin accounts
- Enable HTTPS in production
- Regularly update dependencies
- Monitor authentication logs
- Implement rate limiting for production

## 📈 Performance Tips

- Use database indexes for frequently queried fields
- Implement caching for read-heavy operations
- Use connection pooling for database connections
- Monitor and optimize slow queries
- Consider pagination for large datasets

## 🐛 Troubleshooting

### Common Issues:

1. **Database connection errors**
   - Check if PostgreSQL is running
   - Verify DATABASE_URL configuration
   - Ensure database exists

2. **JWT token errors**
   - Check JWT_SECRET_KEY configuration
   - Verify token expiration settings
   - Ensure proper token format in requests

3. **Permission denied errors**
   - Verify user roles and permissions
   - Check authentication status
   - Ensure proper middleware configuration

4. **Migration errors**
   - Check database connectivity
   - Verify model imports in alembic/env.py
   - Review migration files for conflicts

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## 📞 Support

For support, please contact the development team or create an issue in the repository.
