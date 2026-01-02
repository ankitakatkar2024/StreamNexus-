from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd # Needed for handling NA checks safely
from collections import Counter # ✅ Import for Analytics
from datetime import datetime # ✅ Import for Timestamps

from data_loader import load_movies
from recommender import recommender

app = FastAPI(title="StreamNexus API", version="2.3")

# -------------------- CORS --------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------- LOAD DATA --------------------
movies = load_movies()

# 📊 ANALYTICS STORAGE (In-Memory Database)
# In a production app, this would be a real database like PostgreSQL or MongoDB
interaction_logs = []

# -------------------- HELPER FUNCTIONS --------------------
# ✅ Helper function to find shared genres for explanation
def get_explanation(source_genres, target_genres):
    # Handle cases where genres might be None or float(nan)
    if not source_genres or pd.isna(source_genres): source_genres = ""
    if not target_genres or pd.isna(target_genres): target_genres = ""

    # Convert "Action|Adventure|Sci-Fi" strings into sets
    s_set = set(str(source_genres).replace('|', ',').split(','))
    t_set = set(str(target_genres).replace('|', ',').split(','))
    
    # Find common genres
    common = list(s_set.intersection(t_set))
    
    # Clean up empty strings and take top 2
    common = [g.strip() for g in common if g.strip()]
    
    if not common:
        return "Visual Similarity" # Fallback if no genre match
        
    return f"Because you like {', '.join(common[:2])}"

# -------------------- ROUTES --------------------

@app.get("/")
def home():
    return {
        "status": "online",
        "movies_loaded": len(movies),
        "analytics_events": len(interaction_logs)
    }

@app.get("/movies")
def get_movies(
    genre: str | None = None,
    exclude: str | None = None,
    limit: int = 20
):
    if movies.empty:
        return {"movies": []}

    filtered = movies.copy()

    if genre:
        filtered = filtered[
            filtered["genres"].str.contains(genre, case=False, na=False)
        ]

    if exclude:
        filtered = filtered[
            ~filtered["genres"].str.contains(exclude, case=False, na=False)
        ]

    return {
        "count": min(limit, len(filtered)),
        "movies": filtered.head(limit).to_dict(orient="records")
    }

@app.get("/search")
def search_movies(query: str, limit: int = 20):
    if movies.empty:
        return {"movies": []}

    results = movies[
        movies["title"].str.contains(query, case=False, na=False)
    ]

    return {
        "count": min(limit, len(results)),
        "movies": results.head(limit).to_dict(orient="records")
    }

@app.get("/recommendations")
def get_recommendations(title: str):
    try:
        # 1. Get basic recommendations from your existing module
        results = recommender.get_recommendations(title)
        
        if not results:
            return {"source_movie": title, "recommendations": []}

        # 2. Find Source Movie Genres (for comparison)
        source_row = movies[movies['title'].str.lower() == title.lower()]
        source_genres = ""
        if not source_row.empty:
            source_genres = source_row.iloc[0]['genres']

        # 3. Add "Explainable AI" field to each result
        enhanced_results = []
        for rec_movie in results:
            # Calculate the "Why" using the helper function
            rec_genres = rec_movie.get('genres', '')
            reason_text = get_explanation(source_genres, rec_genres)
            
            # Create a new dict to avoid modifying the original
            enhanced_movie = rec_movie.copy()
            enhanced_movie['explanation'] = reason_text
            enhanced_results.append(enhanced_movie)

        return {
            "source_movie": title,
            "recommendations": enhanced_results
        }

    except Exception as e:
        print(f"Error generating recommendations: {e}")
        return {"error": str(e), "recommendations": []}

# -------------------- 📊 ANALYTICS ENDPOINTS (NEW) --------------------

@app.post("/log/interaction")
def log_interaction(event: dict):
    # event expects: {"title": "Avatar", "genres": "Action|Sci-Fi"}
    interaction_logs.append(event)
    return {"status": "logged"}

@app.get("/analytics")
def get_analytics():
    if not interaction_logs:
        return {"top_movies": [], "top_genres": [], "total_interactions": 0}

    # 1. Top Movies
    titles = [log["title"] for log in interaction_logs]
    movie_counts = Counter(titles).most_common(5)
    top_movies = [{"name": title, "views": count} for title, count in movie_counts]

    # 2. Top Genres
    all_genres = []
    for log in interaction_logs:
        if "genres" in log and log["genres"]:
            genres = str(log["genres"]).replace("|", ",").split(",")
            all_genres.extend([g.strip() for g in genres])
    
    genre_counts = Counter(all_genres).most_common(5)
    top_genres = [{"name": genre, "value": count} for genre, count in genre_counts]

    return {
        "top_movies": top_movies,
        "top_genres": top_genres,
        "total_interactions": len(interaction_logs)
    }