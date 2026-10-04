import sqlite3
from pathlib import Path


DB_PATH = Path("conflicts.db")


def get_connection():
    return sqlite3.connect(DB_PATH)


def init_database():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS conflicts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            document_a TEXT NOT NULL,
            document_b TEXT NOT NULL,
            text_a TEXT NOT NULL,
            text_b TEXT NOT NULL,
            line_a INTEGER,
            line_b INTEGER,
            conflict_type TEXT,
            confidence REAL
        )
    """)

    connection.commit()
    connection.close()


def save_conflict(
    document_a,
    document_b,
    text_a,
    text_b,
    line_a=None,
    line_b=None,
    conflict_type=None,
    confidence=None
):
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        INSERT INTO conflicts (
            document_a,
            document_b,
            text_a,
            text_b,
            line_a,
            line_b,
            conflict_type,
            confidence
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        document_a,
        document_b,
        text_a,
        text_b,
        line_a,
        line_b,
        conflict_type,
        confidence
    ))

    connection.commit()
    connection.close()

def get_conflicts():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        SELECT
            id,
            document_a,
            document_b,
            text_a,
            text_b,
            line_a,
            line_b,
            conflict_type,
            confidence
        FROM conflicts
        ORDER BY id DESC
    """)

    rows = cursor.fetchall()

    connection.close()

    conflicts = []

    for row in rows:
        conflicts.append({
            "id": row[0],
            "document_a": row[1],
            "document_b": row[2],
            "text_a": row[3],
            "text_b": row[4],
            "line_a": row[5],
            "line_b": row[6],
            "conflict_type": row[7],
            "confidence": row[8]
        })

    return conflicts

def delete_conflicts_for_document(filename):
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("""
        DELETE FROM conflicts
        WHERE document_a = ? OR document_b = ?
    """, (filename, filename))

    connection.commit()
    connection.close()

def clear_all_conflicts():
    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute("DELETE FROM conflicts")

    connection.commit()

    deleted_count = cursor.rowcount

    connection.close()

    print(f"Deleted {deleted_count} conflicts")