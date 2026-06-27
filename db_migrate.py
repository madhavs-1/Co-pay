from sqlalchemy import inspect, text

from models import db


def _table_columns(inspector, table_name):
    if table_name not in inspector.get_table_names():
        return set()
    return {column["name"] for column in inspector.get_columns(table_name)}


def upgrade_schema():
    """Apply lightweight SQLite migrations for columns added after first deploy."""
    inspector = inspect(db.engine)
    groups_columns = _table_columns(inspector, "groups")

    if "groups" in inspector.get_table_names() and "image_url" not in groups_columns:
        db.session.execute(text("ALTER TABLE groups ADD COLUMN image_url TEXT"))
        db.session.commit()

    db.create_all()
