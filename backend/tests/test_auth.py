import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_and_login():
    unique_email = f"teststudent_{int(time.time())}@example.com"
    password = "secretpassword123"
    
    # Register
    reg_response = client.post(
        "/api/v1/auth/register",
        json={"email": unique_email, "password": password, "full_name": "Test Student"}
    )
    assert reg_response.status_code == 201
    
    # Login
    login_response = client.post(
        "/api/v1/auth/login",
        json={"email": unique_email, "password": password}
    )
    assert login_response.status_code == 200
    data = login_response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
