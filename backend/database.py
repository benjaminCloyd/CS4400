import mysql.connector
from mysql.connector import Error
from dotenv import load_dotenv
import os

load_dotenv()

DB_CONFIG = {
    "user":     os.getenv("DB_USER",     "root"),
    "password": os.getenv("DB_PASSWORD", "password1"),
    "host":     os.getenv("DB_HOST",     "127.0.0.1"),
    "database": os.getenv("DB_NAME",     "reward_program"),
}


def get_connection():
    """Open and return a new mysql.connector connection."""
    return mysql.connector.connect(**DB_CONFIG)


def get_db():
    """
    FastAPI dependency — yields a connection and closes it when the
    request finishes (same pattern as before, just mysql.connector).
    """
    cnx = get_connection()
    try:
        yield cnx
    finally:
        cnx.close()
