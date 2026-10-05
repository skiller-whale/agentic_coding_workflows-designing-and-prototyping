"""Database connection and models for the URL shortener."""

import os

from peewee import BigAutoField, Model, TextField
from playhouse.db_url import connect

database = connect(
    os.environ.get(
        "DATABASE_URL", "postgresql://shortener:shortener@localhost:5432/shortener"
    ),
    autoconnect=False,
)


class BaseModel(Model):
    class Meta:
        database = database


class Link(BaseModel):
    id = BigAutoField()
    url = TextField()

    class Meta:
        table_name = "links"
