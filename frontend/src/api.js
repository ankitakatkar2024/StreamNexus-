const API_URL = "http://127.0.0.1:8000";

export const getMovies = async (genre, exclude) => {
  let url = `${API_URL}/movies?limit=50`;
  if (genre) url += `&genre=${encodeURIComponent(genre)}`;
  if (exclude) url += `&exclude=${encodeURIComponent(exclude)}`;

  try {
    const res = await fetch(url);
    return await res.json();
  } catch (err) {
    console.error("Error fetching movies:", err);
    return { movies: [] };
  }
};

// ✅ TITLE SEARCH
export const searchMovies = async (query) => {
  try {
    const res = await fetch(
      `${API_URL}/search?query=${encodeURIComponent(query)}`
    );
    return await res.json();
  } catch (err) {
    console.error("Error searching movies:", err);
    return { movies: [] };
  }
};

export const getRecommendations = async (title) => {
  try {
    const res = await fetch(
      `${API_URL}/recommendations?title=${encodeURIComponent(title)}`
    );
    return await res.json();
  } catch (err) {
    console.error("Error fetching recommendations:", err);
    return { recommendations: [] };
  }
};

export const getMovieDetails = async (title) => {
  const API_KEY = "245f0a04"; // 🔴 Use your specific OMDb key here!
  
  try {
    // 1. Clean title logic (same as MovieCard)
    const cleanTitle = title.replace(/\(\d{4}\)/, "").trim();
    const yearMatch = title.match(/\((\d{4})\)/);
    const year = yearMatch ? yearMatch[1] : "";

    // 2. Ask OMDb for full details (Plot, Actors, Rating)
    const url = `https://www.omdbapi.com/?apikey=${API_KEY}&t=${encodeURIComponent(cleanTitle)}${year ? `&y=${year}` : ""}&plot=full`;
    
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching details:", error);
    return null;
  }
};

// -------------------- 📊 ANALYTICS FUNCTIONS (NEW) --------------------

export const logInteraction = async (movie) => {
  try {
    await fetch(`${API_URL}/log/interaction`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: movie.title,
        genres: movie.genres
      }),
    });
  } catch (error) {
    console.error("Log error", error);
  }
};

export const getAnalytics = async () => {
  try {
    const res = await fetch(`${API_URL}/analytics`);
    return await res.json();
  } catch (error) {
    console.error("Analytics Fetch Error", error);
    return null;
  }
};