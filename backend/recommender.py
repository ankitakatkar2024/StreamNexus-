# backend/recommender.py

import random
from data_loader import load_movies


class MovieRecommender:
    def __init__(self):
        """
        Initialize the recommender and load movies once
        when the backend starts.
        """
        self.movies = load_movies()
        print("🧠 AI Brain: Recommender initialized.")


    def get_recommendations(self, title: str, top_n: int = 10):
        """
        Recommend movies based on shared genres.
        """
        if self.movies.empty:
            return []

        title = title.strip().lower()

        # 1️⃣ Find the movie (case-insensitive exact match)
        movie_match = self.movies[
            self.movies["title"].str.lower() == title
        ]

        if movie_match.empty:
            return []

        # 2️⃣ Extract genres (e.g. Action|Adventure)
        target_genres = movie_match.iloc[0]["genres"]

        if not target_genres:
            return []

        genre_list = target_genres.split("|")
        primary_genre = genre_list[0]

        # 3️⃣ Find movies sharing the primary genre
        recommendations = self.movies[
            (self.movies["genres"].str.contains(primary_genre, case=False, na=False)) &
            (self.movies["title"].str.lower() != title)
        ]

        if recommendations.empty:
            return []

        # 4️⃣ Shuffle results for variety
        if len(recommendations) > top_n:
            recommendations = recommendations.sample(n=top_n, random_state=random.randint(0, 10000))
        else:
            recommendations = recommendations.head(top_n)

        return recommendations.to_dict(orient="records")


# ✅ Global singleton (imported by main.py)
recommender = MovieRecommender()
