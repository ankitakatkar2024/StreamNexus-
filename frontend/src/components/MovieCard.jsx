import { useEffect, useState } from "react";

// 🔴 PASTE YOUR NEW API KEY INSIDE THE QUOTES BELOW
const OMDB_API_KEY = "245f0a04"; 

// ✅ Helper to truncate long text
const truncateText = (text, maxLength) => {
  if (!text) return "";
  return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
};

const MovieCard = ({ movie, onClick }) => {
  const [poster, setPoster] = useState(null);

  useEffect(() => {
    // If the backend provided a TMDB poster, use it directly!
    if (movie.poster && movie.poster.startsWith("http") && !movie.poster.includes("placeholder")) {
        setPoster(movie.poster);
        return;
    }

    // Safety check: if movie has no title, don't do anything
    if (!movie?.title) return;

    // 1. CHECK CACHE FIRST (Saves your API limit)
    const cacheKey = `poster_${movie.movieId}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      setPoster(cached);
      return;
    }

    // 2. FETCH FROM API
    const fetchPoster = async () => {
      try {
        // Clean the title: "Avatar (2009)" -> "Avatar"
        const cleanTitle = movie.title.replace(/\(\d{4}\)/, "").trim();
        
        // Extract the year: "Avatar (2009)" -> "2009"
        const yearMatch = movie.title.match(/\((\d{4})\)/);
        const year = yearMatch ? yearMatch[1] : "";

        // Build the URL
        const url = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}&t=${encodeURIComponent(cleanTitle)}${year ? `&y=${year}` : ""}`;

        const res = await fetch(url);
        
        // Check if the key is invalid or limit reached
        if (res.status === 401) {
             console.error("❌ Error: Invalid API Key or Daily Limit Reached.");
             return;
        }

        const data = await res.json();

        // If we found a valid poster, save it
        if (data?.Poster && data.Poster !== "N/A") {
          setPoster(data.Poster);
          // Save to browser storage so we don't fetch again
          localStorage.setItem(cacheKey, data.Poster);
        }
      } catch (e) {
        // If fetch fails, we just show the gray placeholder
        console.warn("Poster fetch failed for:", movie.title);
      }
    };

    fetchPoster();
  }, [movie.movieId, movie.title, movie.poster]);

  return (
    // 1. OUTER CONTAINER: No 'overflow-hidden' here so the popup can stick out!
    <div 
      onClick={() => onClick(movie)}
      className="relative min-w-[160px] md:min-w-[200px] group mr-4 cursor-pointer z-0 hover:z-50"
    >
      
      {/* 🎯 THE POP-UP BUBBLE WITH ARROW */}
      {movie.explanation && (
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[110%] opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-2 pointer-events-none z-50">
          
          {/* The Box */}
          <div className="bg-white text-black text-[11px] font-bold p-3 rounded-lg shadow-[0_10px_25px_rgba(0,0,0,0.5)] text-center relative border-2 border-yellow-400">
            <span className="text-yellow-600 uppercase text-[9px] block tracking-wider mb-1">AI Insight</span>
            {movie.explanation}
            
            {/* The Arrow (CSS Triangle Hack) */}
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-yellow-400"></div>
          </div>
        </div>
      )}

      {/* 2. INNER IMAGE CONTAINER: Keeps the image rounded and neat */}
      <div className="h-[240px] md:h-[300px] rounded-lg overflow-hidden relative shadow-lg border border-gray-700 transition-transform duration-300 group-hover:scale-105 bg-gray-900">
        
        {/* Poster */}
        {poster ? (
          <img src={poster} alt={movie.title} className="w-full h-full object-cover opacity-90 group-hover:opacity-100" />
        ) : (
          /* FALLBACK: If no image, show the First Letter of the title */
          <div className="flex items-center justify-center h-full text-gray-600 text-6xl font-bold bg-gray-900">
            {movie.title?.[0]}
          </div>
        )}

        {/* Text Overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/80 to-transparent">
           <h3 className="text-white font-bold text-sm truncate">{movie.title}</h3>
           <p className="text-gray-400 text-xs">{truncateText(movie.genres?.split("|")[0] || "", 20)}</p>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;