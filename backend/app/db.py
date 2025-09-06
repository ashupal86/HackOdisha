"""
Database configuration and session management
"""
from sqlmodel import create_engine, SQLModel, Session
from app.config import settings
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create database engine
engine = create_engine(
    str(settings.DATABASE_URL),
    echo=settings.DEBUG,  # Enable SQL query logging in debug mode
    pool_size=20,
    max_overflow=0,
    pool_pre_ping=True,  # Validate connections before use
)


def create_db_and_tables():
    """Create database tables"""
    try:
        SQLModel.metadata.create_all(engine)
        logger.info("Database tables created successfully")
    except Exception as e:
        logger.error(f"Failed to create database tables: {e}")
        raise


def get_session():
    """Dependency to get database session"""
    with Session(engine) as session:
        try:
            yield session
        finally:
            session.close()


def init_db():
    """Initialize database"""
    create_db_and_tables()
