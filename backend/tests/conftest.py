import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.deps import get_db_session
from app.db.base import Base
from app.main import app

TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture()
def db_session():
    engine = create_engine(
        TEST_DATABASE_URL, connect_args={"check_same_thread": False}
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)

    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db_session] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()
