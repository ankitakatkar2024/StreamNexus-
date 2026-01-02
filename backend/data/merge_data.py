import pandas as pd
import json
import re
import os

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent

HOLLYWOOD_FILE = BASE_DIR / "tmdb_5000_movies.csv"
BOLLYWOOD_FILE = BASE_DIR / "bollywood_movies.csv"

OUTPUT_MOVIES = BASE_DIR / "movies.csv"
OUTPUT_LINKS = BASE_DIR / "links.csv"


# --- HELPER FUNCTIONS ---

def parse_tmdb_genres(json_str):
    """Parses columns like '[{"id": 28, "name": "Action"}]' into 'Action'"""
    try:
        data = json.loads(json_str)
        names = [g['name'] for g in data]
        return "|".join(names)
    except:
        return ""

def clean_bollywood_title(title):
    """Removes the numbering like '1. Animal' -> 'Animal'"""
    # Regex to remove starting digits and dots
    return re.sub(r'^\d+\.\s*', '', str(title))

def infer_bollywood_genre(summary):
    """Guesses genre from the summary text since Bollywood file lacks a genre column"""
    text = str(summary).lower()
    genres = []
    
    if 'action' in text or 'fight' in text or 'war' in text or 'police' in text: genres.append('Action')
    if 'comedy' in text or 'funny' in text or 'laugh' in text: genres.append('Comedy')
    if 'thriller' in text or 'murder' in text or 'mystery' in text or 'crime' in text: genres.append('Thriller')
    if 'romance' in text or 'love' in text or 'heart' in text: genres.append('Romance')
    if 'drama' in text or 'family' in text or 'emotional' in text: genres.append('Drama')
    
    # Default to Drama if nothing found
    if not genres: return "Drama"
    return "|".join(genres)

# --- MAIN LOGIC ---

try:
    print("⏳ Loading CSV files...")
    
    # 1. LOAD HOLLYWOOD
    df_hollywood = pd.read_csv(HOLLYWOOD_FILE)
    print(f"   - Loaded {len(df_hollywood)} Hollywood movies")
    
    # Process Hollywood Data
    # ID is 'id', Title is 'title', Genres is 'genres' (needs parsing)
    df_hollywood['movieId'] = df_hollywood['id']
    df_hollywood['genres'] = df_hollywood['genres'].apply(parse_tmdb_genres)
    
    # Select only what we need
    hollywood_final = df_hollywood[['movieId', 'title', 'genres']].copy()

    # 2. LOAD BOLLYWOOD
    df_bollywood = pd.read_csv(BOLLYWOOD_FILE)
    print(f"   - Loaded {len(df_bollywood)} Bollywood movies")
    
    # Process Bollywood Data
    # Generate IDs starting after the last Hollywood ID
    max_id = int(hollywood_final['movieId'].max())
    df_bollywood['movieId'] = range(max_id + 1, max_id + 1 + len(df_bollywood))
    
    # Clean Title and Infer Genre
    df_bollywood['title'] = df_bollywood['Film Name'].apply(clean_bollywood_title)
    df_bollywood['genres'] = df_bollywood['Summary'].apply(infer_bollywood_genre)
    
    # Select only what we need
    bollywood_final = df_bollywood[['movieId', 'title', 'genres']].copy()

    # 3. MERGE
    print("⏳ Merging datasets...")
    all_movies = pd.concat([hollywood_final, bollywood_final], ignore_index=True)

    # 4. GENERATE LINKS.CSV (Crucial for the app to not crash)
    print("⏳ Generating links.csv...")
    links_data = []
    for _, row in all_movies.iterrows():
        mid = row['movieId']
        links_data.append({
            "movieId": mid,
            "imdbId": "",   # Placeholder
            "tmdbId": mid   # Use valid ID as placeholder
        })
    df_links = pd.DataFrame(links_data)

    # 5. SAVE
    # Ensure folder exists
    all_movies.to_csv(OUTPUT_MOVIES, index=False)
    df_links.to_csv(OUTPUT_LINKS, index=False)


    print(f"\n✅ SUCCESS! Master database created with {len(all_movies)} movies.")
    print(f"   - Saved to: {OUTPUT_MOVIES}")

except FileNotFoundError as e:
    print(f"\n❌ ERROR: Could not find file: {e}")
    print("   Make sure the .csv files are in the same folder as this script.")
except Exception as e:
    print(f"\n❌ ERROR: {e}")