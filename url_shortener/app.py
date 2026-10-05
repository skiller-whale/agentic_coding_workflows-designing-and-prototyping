"""A small URL shortener backed by PostgreSQL."""

from urllib.parse import urlsplit

from flask import Flask, jsonify, redirect, request, url_for

from models import Link, database
from short_codes import decode_code, encode_id

app = Flask(__name__)


@app.before_request
def open_database():
    database.connect()


@app.teardown_request
def close_database(_error):
    if not database.is_closed():
        database.close()


def init_db():
    with database.connection_context():
        database.create_tables([Link])


def is_http_url(value):
    if not isinstance(value, str) or not value or value != value.strip():
        return False
    try:
        parts = urlsplit(value)
        # Accessing .port also rejects malformed or out-of-range ports.
        _ = parts.port
        return parts.scheme in ("http", "https") and bool(parts.hostname)
    except ValueError:
        return False


def id_from_code(code):
    try:
        return decode_code(code)
    except ValueError:
        return None


@app.post("/links")
def create_link():
    body = request.get_json(silent=True)
    long_url = body.get("url") if isinstance(body, dict) else None
    if not is_http_url(long_url):
        return jsonify(error="url must be an absolute HTTP or HTTPS URL"), 400

    link = Link.create(url=long_url)
    code = encode_id(link.id)
    return jsonify(code=code, short_url=url_for("get_link", code=code, _external=True)), 201


@app.get("/<code>")
def get_link(code):
    row_id = id_from_code(code)
    if row_id is None:
        return jsonify(error="link not found"), 404

    link = Link.select().where(Link.id == row_id).first()
    if link is None:
        return jsonify(error="link not found"), 404
    return redirect(link.url, code=302)


@app.delete("/links/<code>")
def delete_link(code):
    row_id = id_from_code(code)
    if row_id is None:
        return jsonify(error="link not found"), 404

    deleted = Link.delete().where(Link.id == row_id).execute()
    if deleted == 0:
        return jsonify(error="link not found"), 404
    return "", 204


if __name__ == "__main__":
    init_db()
    app.run(host="0.0.0.0", port=5000)
