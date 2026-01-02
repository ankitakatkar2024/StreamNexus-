# backend/data_loader.py

import pandas as pd
import sqlite3
from pathlib import Path


def load_movies():
    """
    Loads movies from the SQLite database (streamnexus.db)
    and returns a Pandas DataFrame.
    """

    BASE_DIR = Path(__file__).resolve().parent
    db_path = BASE_DIR / "streamnexus.db"

    if not db_path.exists():
        print(f"❌ CRITICAL ERROR: Database not found at {db_path}")
        print("   Run 'python init_db.py' to create it.")
        return pd.DataFrame()

    try:
        with sqlite3.connect(db_path) as conn:
            df = pd.read_sql("SELECT * FROM movies", conn)

        # Clean data
        df = df.fillna("")

        # Ensure movieId is string (frontend-safe)
        if "movieId" in df.columns:
            df["movieId"] = df["movieId"].astype(str)

        print(f"✅ Data Loader: Successfully loaded {len(df)} movies from database.")
        return df

    except Exception as e:
        print(f"❌ Data Loader Error: {e}")
        return pd.DataFrame()


# --------------------------------------------------
# Run this file directly to verify DB loading
# --------------------------------------------------
if __name__ == "__main__":
    print("Loading StreamNexus data from database...\n")

    df = load_movies()

    if df.empty:
        print("❌ No data loaded.")
    else:
        print("✔ Data loaded successfully!")
        print(f"Loaded {len(df)} movies.\n")

        print("--- Sample Movies ---")
        print(df.head(5))
