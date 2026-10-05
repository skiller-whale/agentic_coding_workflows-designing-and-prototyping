# URL shortener

A small Flask service backed by a local PostgreSQL database. Peewee defines the
link model and handles database queries. Each created link gets a database row
ID. The short code is that ID written in base62; reading a short code converts
it back to the row ID and looks up the destination.

## Run

From this directory:

```bash
docker compose up --build -d
```

The service listens at `http://localhost:5000`. PostgreSQL data is kept in a
named Docker volume, so it survives container restarts.

## API

Create a link:

```bash
curl -i -X POST http://localhost:5000/links \
  -H 'Content-Type: application/json' \
  -d '{"url":"https://train.skillerwhale.com/example"}'
```

The response is `201` with a `code` and `short_url`. Every POST creates a new
row, including repeated URLs. Only absolute HTTP and HTTPS URLs are accepted.

Visit the returned `short_url` to get a `302` redirect. Remove a link with:

```bash
curl -i -X DELETE http://localhost:5000/links/1
```

The delete endpoint returns `204` on success. Unknown or invalid codes return
`404` for redirects and deletes. A deleted code is never assigned to a new row.

## Tests

With the database running, execute:

```bash
docker compose run --rm app python -m pytest -q
```

Stop the service with `docker compose down`. Add `-v` only if you intend to
discard the local database.
