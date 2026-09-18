import time
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_applications_flow():
    # 1. Register & Login
    unique_email = f"apptracker_{int(time.time())}@example.com"
    password = "trackerpassword123"
    client.post("/api/v1/auth/register", json={"email": unique_email, "password": password, "full_name": "Tracker User"})
    login_res = client.post("/api/v1/auth/login", json={"email": unique_email, "password": password})
    assert login_res.status_code == 200
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    # 2. Create Application
    create_res = client.post(
        "/api/v1/applications/",
        headers=headers,
        json={
            "company": "Google",
            "role": "Software Engineer",
            "status": "Applied",
            "job_url": "https://careers.google.com",
            "notes": "Referred by alumnus"
        }
    )
    assert create_res.status_code == 201
    app_data = create_res.json()
    assert app_data["company"] == "Google"
    assert app_data["status"] == "Applied"
    app_id = app_data["id"]

    # 3. List Applications
    list_res = client.get("/api/v1/applications/", headers=headers)
    assert list_res.status_code == 200
    assert len(list_res.json()) >= 1

    # 4. Update Application
    update_res = client.put(
        f"/api/v1/applications/{app_id}",
        headers=headers,
        json={"status": "Interview", "interview_date": "2026-10-15"}
    )
    assert update_res.status_code == 200
    assert update_res.json()["status"] == "Interview"

    # 5. Delete Application
    del_res = client.delete(f"/api/v1/applications/{app_id}", headers=headers)
    assert del_res.status_code == 204
