import uuid

import pytest

from app import app, init_db


@pytest.fixture(scope="module", autouse=True)
def database_schema():
    init_db()


@pytest.fixture
def client():
    return app.test_client()


def test_create_redirect_and_delete(client):
    destination = f"https://example.com/{uuid.uuid4()}"
    created = client.post("/links", json={"url": destination})
    assert created.status_code == 201
    code = created.json["code"]
    assert created.json["short_url"].endswith(f"/{code}")

    redirected = client.get(f"/{code}")
    assert redirected.status_code == 302
    assert redirected.headers["Location"] == destination

    deleted = client.delete(f"/links/{code}")
    assert deleted.status_code == 204
    assert client.get(f"/{code}").status_code == 404
    assert client.delete(f"/links/{code}").status_code == 404


def test_repeated_url_gets_a_new_code(client):
    destination = f"https://example.com/{uuid.uuid4()}"
    first = client.post("/links", json={"url": destination}).json["code"]
    second = client.post("/links", json={"url": destination}).json["code"]
    try:
        assert first != second
        assert client.get(f"/{first}").headers["Location"] == destination
        assert client.get(f"/{second}").headers["Location"] == destination
    finally:
        client.delete(f"/links/{first}")
        client.delete(f"/links/{second}")


@pytest.mark.parametrize(
    "body",
    [{}, {"url": "not a URL"}, {"url": "file:///tmp/a"}, {"url": "https://example.com:bad"}],
)
def test_rejects_invalid_urls(client, body):
    assert client.post("/links", json=body).status_code == 400


def test_unknown_code(client):
    assert client.get("/not-a-code!").status_code == 404
    assert client.delete("/links/not-a-code!").status_code == 404
