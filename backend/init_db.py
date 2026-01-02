# backend/init_db.py

import sqlite3
import pandas as pd
from pathlib import Path


def init_db():
    # Base directory: backend/
    BASE_DIR = Path(__file__).resolve().parent

    csv_path = BASE_DIR / "data" / "movies.csv"
    db_path = BASE_DIR / "streamnexus.db"

    # Check if CSV exists
    if not csv_path.exists():
        print(f"❌ CRITICAL ERROR: File not found at {csv_path}")
        print("   Did you run merge_data.py first?")
        return

    print("⏳ Reading CSV file...")

    try:
        df = pd.read_csv(csv_path)

        # Clean data
        df = df.fillna("")
        if "movieId" in df.columns:
            df["movieId"] = df["movieId"].astype(str)

        print(f"⏳ Creating SQLite database at {db_path}...")

        conn = sqlite3.connect(db_path)

        # Write movies table
        df.to_sql("movies", conn, if_exists="replace", index=False)

        # Index for fast search
        conn.execute(
            "CREATE INDEX IF NOT EXISTS idx_movies_title ON movies(title)"
        )

        conn.close()

        print(f"✅ SUCCESS! Database created with {len(df)} movies.")

    except Exception as e:
        print(f"❌ Error creating database: {e}")


if __name__ == "__main__":
    init_db()
