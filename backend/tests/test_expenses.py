def test_add_expense(client):
    resp = client.post(
        "/api/expenses",
        json={"description": "Swiggy", "amount": 487.0, "date": "2026-08-11"},
    )
    assert resp.status_code == 201
    data = resp.json()
    assert data["description"] == "Swiggy"
    assert data["amount"] == 487.0
    assert "id" in data


def test_add_expense_rejects_non_positive_amount(client):
    resp = client.post(
        "/api/expenses",
        json={"description": "Bad", "amount": 0, "date": "2026-08-11"},
    )
    assert resp.status_code == 422
    detail = resp.json()["detail"]
    assert any(err["field"] == "amount" for err in detail)


def test_get_expenses_returns_all_when_no_filter(client):
    client.post("/api/expenses", json={"description": "A", "amount": 10, "date": "2026-08-01"})
    client.post("/api/expenses", json={"description": "B", "amount": 20, "date": "2026-08-05"})

    resp = client.get("/api/expenses")
    assert resp.status_code == 200
    assert len(resp.json()) == 2


def test_get_expenses_date_filter(client):
    client.post("/api/expenses", json={"description": "A", "amount": 10, "date": "2026-07-01"})
    client.post("/api/expenses", json={"description": "B", "amount": 20, "date": "2026-08-05"})

    resp = client.get("/api/expenses", params={"startDate": "2026-08-01", "endDate": "2026-08-31"})
    assert resp.status_code == 200
    results = resp.json()
    assert len(results) == 1
    assert results[0]["description"] == "B"


def test_get_total_amount(client):
    client.post("/api/expenses", json={"description": "A", "amount": 10, "date": "2026-08-01"})
    client.post("/api/expenses", json={"description": "B", "amount": 20, "date": "2026-08-05"})

    resp = client.get("/api/expenses/total", params={"startDate": "2026-08-01", "endDate": "2026-08-31"})
    assert resp.status_code == 200
    assert resp.json() == 30.0


def test_update_expense(client):
    created = client.post(
        "/api/expenses", json={"description": "A", "amount": 10, "date": "2026-08-01"}
    ).json()

    resp = client.put(
        f"/api/expenses/{created['id']}",
        json={"description": "Updated", "amount": 15, "date": "2026-08-02"},
    )
    assert resp.status_code == 200
    data = resp.json()
    assert data["description"] == "Updated"
    assert data["amount"] == 15.0


def test_update_nonexistent_expense_returns_404(client):
    resp = client.put(
        "/api/expenses/9999",
        json={"description": "X", "amount": 5, "date": "2026-08-01"},
    )
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()


def test_delete_expense(client):
    created = client.post(
        "/api/expenses", json={"description": "A", "amount": 10, "date": "2026-08-01"}
    ).json()

    resp = client.delete(f"/api/expenses/{created['id']}")
    assert resp.status_code == 200
    assert resp.json() == {"deleted": True}

    resp = client.get("/api/expenses")
    assert resp.json() == []


def test_delete_nonexistent_expense_returns_404(client):
    resp = client.delete("/api/expenses/9999")
    assert resp.status_code == 404
