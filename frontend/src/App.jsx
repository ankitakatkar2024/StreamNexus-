import { useState, useEffect } from "react";
import { getMovies, getRecommendations, getMovieDetails, logInteraction } from "./api";
import MovieCard from "./components/MovieCard";
import VideoPlayer from "./components/VideoPlayer";
import VoiceSearch from "./components/VoiceSearch";
import SkeletonCard from "./components/SkeletonCard"; 
import AdminDashboard from "./components/AdminDashboard";

// ✅ FIREBASE IMPORTS
import { auth, provider, signInWithPopup, signOut, db, doc, getDoc, setDoc, updateDoc, arrayUnion, arrayRemove } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

// Default Hero Background (Abstract/Tech)
const HERO_BG = "https://images.unsplash.com/photo-1616530940355-351fabd9524b?q=80&w=2670&auto=format&fit=crop"; 

// --- ICONS ---
const SearchIcon = () => (<svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>);
const PlayIcon = () => (<svg className="w-8 h-8 mr-2 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>);
const StarIcon = () => (<svg className="w-5 h-5 text-yellow-500 mr-1" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>);
const ShuffleIcon = () => (<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>);
const GoogleIcon = () => (<svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor"><path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/></svg>);
const ArrowRightIcon = () => (<svg className="w-6 h-6 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>);

// --- COMPONENT: Movie Row ---
const MovieRow = ({ title, movies, onMovieClick, isLoading }) => {
  if (!isLoading && (!movies || movies.length === 0)) return null;
  return (
    <div className="mb-8 pl-6 md:pl-16 relative z-30">
      <h2 className="text-2xl md:text-3xl font-bold mb-2 text-white tracking-wide border-l-4 border-red-600 pl-4 hover:text-red-500 transition-colors cursor-pointer inline-flex items-center group">
        {title} 
        <span className="text-sm font-normal text-gray-400 ml-4 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-[-10px] group-hover:translate-x-0 duration-300">
          View All →
        </span>
      </h2>
      
      <div className="flex overflow-x-auto pb-8 pt-24 -mt-20 scrollbar-hide items-start space-x-6 pr-6">
        {isLoading 
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : movies.map((movie) => (
              <MovieCard key={movie.movieId} movie={movie} onClick={onMovieClick} />
            ))
        }
      </div>
    </div>
  );
};

// --- MAIN APP ---
export default function App() {
  const [user, setUser] = useState(null);

  const [trending, setTrending] = useState([]);
  const [adventure, setAdventure] = useState([]);
  const [comedy, setComedy] = useState([]);
  const [scifi, setScifi] = useState([]);
  const [crime, setCrime] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [heroSearchTerm, setHeroSearchTerm] = useState(""); 
  const [searchResults, setSearchResults] = useState([]); 
  
  // Active Movie State
  const [activeMovie, setActiveMovie] = useState(null);
  const [movieDetails, setMovieDetails] = useState(null);
  
  const [recommendations, setRecommendations] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [myList, setMyList] = useState([]);
  const [showDashboard, setShowDashboard] = useState(false);
  const [navbarBlack, setNavbarBlack] = useState(false);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      await new Promise(r => setTimeout(r, 500));
      setTrending((await getMovies("Action", null)).movies || []);
      setAdventure((await getMovies("Adventure", "Romance")).movies || []);
      setComedy((await getMovies("Comedy", "Romance")).movies || []);
      setScifi((await getMovies("Science Fiction", "Romance")).movies || []);
      setCrime((await getMovies("Crime", null)).movies || []);
      setLoading(false);
    }
    loadData();

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
        setUser(currentUser);
        if (currentUser) {
            try {
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setMyList(userSnap.data().watchlist || []);
                }
            } catch (error) { console.error("Error fetching user data:", error); }
        } else {
            setMyList([]); 
        }
    });

    const scrollListener = () => setNavbarBlack(window.scrollY > 50);
    window.addEventListener("scroll", scrollListener);
    return () => { window.removeEventListener("scroll", scrollListener); unsubscribe(); };
  }, []);

  const handleLogin = async () => { try { await signInWithPopup(auth, provider); } catch (e) { console.error("Login Failed:", e); } };
  const handleLogout = async () => { await signOut(auth); };

  const handleToggleList = async () => {
    if (!activeMovie) return;
    if (!user) { alert("🔒 Please Sign In with Google to save movies!"); return; }

    const exists = myList.find(m => m.title === activeMovie.title);
    const userRef = doc(db, "users", user.uid);
    let newList;

    try {
        if (exists) {
            newList = myList.filter(m => m.title !== activeMovie.title);
            await updateDoc(userRef, { watchlist: arrayRemove(activeMovie) });
        } else {
            newList = [activeMovie, ...myList];
            await setDoc(userRef, { watchlist: arrayUnion(activeMovie) }, { merge: true });
        }
        setMyList(newList);
    } catch (e) { console.error("Error syncing:", e); }
  };

  const performSearch = async (term) => {
    if (!term) return;
    setLoading(true);
    const data = await getRecommendations(term);
    if(data.recommendations && data.recommendations.length > 0) {
        const exactMatch = { movieId: "search-match", title: term, genres: "Top Result" };
        const finalResults = [exactMatch, ...data.recommendations];
        setSearchResults(finalResults);
        const details = await getMovieDetails(term);
        
        // SWITCH MODE: Enable Movie View
        setActiveMovie({ title: term, genres: "Search Result", movieId: "search-match" });
        setMovieDetails(details);
        setRecommendations(finalResults);
        setSearchTerm(term); 
    } else {
        setSearchResults([]);
        setRecommendations([]);
    }
    setLoading(false);
  };

  const handleSearch = (e) => { e.preventDefault(); performSearch(searchTerm); };
  const handleHeroSearch = (e) => { e.preventDefault(); performSearch(heroSearchTerm); };
  const handleVoiceSearch = (transcript) => { 
      setSearchTerm(transcript); 
      setHeroSearchTerm(transcript);
      performSearch(transcript); 
  };

  const handleMovieClick = async (movie) => {
    if (movie.movieId === "search-match") return;
    logInteraction(movie);
    setActiveMovie(movie);
    setMovieDetails(null); 
    setRecommendations([]); 
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const [recData, detailsData] = await Promise.all([
       getRecommendations(movie.title),
       getMovieDetails(movie.title)
    ]);
    setRecommendations(recData.recommendations || []);
    setMovieDetails(detailsData);
  };

  const handleSurpriseMe = () => {
    const allMovies = [...trending, ...adventure, ...comedy, ...scifi];
    if (allMovies.length > 0) {
      const randomMovie = allMovies[Math.floor(Math.random() * allMovies.length)];
      handleMovieClick(randomMovie);
    }
  };

  const isInList = activeMovie ? myList.find(m => m.title === activeMovie.title) : false;

  // DYNAMIC BACKGROUND LOGIC
  const currentBackground = activeMovie 
      ? (movieDetails?.Poster && movieDetails.Poster !== 'N/A' ? movieDetails.Poster : activeMovie.Poster) 
      : HERO_BG;

  return (
    <div className="min-h-screen bg-[#000000] text-white font-sans selection:bg-red-600 selection:text-white overflow-x-hidden">
      
      {isPlaying && activeMovie && <VideoPlayer movie={activeMovie} onClose={() => setIsPlaying(false)} />}
      {showDashboard && <AdminDashboard onClose={() => setShowDashboard(false)} />}

      {/* --- NAVBAR --- */}
      <header className={`fixed top-0 w-full z-50 transition-all duration-700 ${navbarBlack ? 'bg-black/90 shadow-2xl backdrop-blur-md' : 'bg-gradient-to-b from-black/80 to-transparent'}`}>
        <div className="flex flex-row items-center justify-between px-6 md:px-16 py-5 max-w-[1920px] mx-auto">
          <div className="flex items-center gap-8">
             <h1 className="text-4xl md:text-5xl font-black tracking-tighter cursor-pointer text-red-600 drop-shadow-md hover:scale-105 transition" onClick={() => { setActiveMovie(null); window.scrollTo({top:0, behavior:'smooth'}) }}>
               STREAM<span className="text-white">NEXUS</span>
             </h1>
          </div>

          <div className="flex items-center gap-6">
             {/* Small Search Bar (Only when viewing a movie) */}
             {activeMovie && (
                 <div className="hidden md:flex items-center gap-2 bg-black/60 border border-gray-600 rounded-full px-4 py-2 focus-within:border-white transition-all">
                    <SearchIcon />
                    <form onSubmit={handleSearch}>
                      <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-32 lg:w-64 bg-transparent text-sm text-white placeholder-gray-400 focus:outline-none" />
                    </form>
                    <VoiceSearch onSearch={handleVoiceSearch} />
                 </div>
             )}

             {/* SURPRISE ME (Always Visible) */}
             <button 
               onClick={handleSurpriseMe}
               className="hidden md:flex items-center text-base font-bold text-gray-300 hover:text-white transition gap-2"
             >
               <ShuffleIcon /> <span className="hidden lg:inline">Surprise Me</span>
             </button>

             <button onClick={() => setShowDashboard(true)} className="hidden lg:block text-xs font-bold text-gray-300 hover:text-white transition uppercase tracking-widest border border-gray-700 px-3 py-1 rounded">Admin</button>

             {/* User / Sign In */}
             {user ? (
               <div className="flex items-center gap-4">
                  <img src={user.photoURL} alt="User" className="w-10 h-10 rounded-full border-2 border-red-600 cursor-pointer" title={`Signed in as ${user.displayName}`} />
                  <button onClick={handleLogout} className="text-sm font-bold text-white hover:underline">Sign Out</button>
               </div>
             ) : (
               <button onClick={handleLogin} className="bg-red-600 text-white px-6 py-2.5 rounded-full font-bold text-base hover:bg-red-700 transition shadow-lg transform hover:scale-105">
                  Sign In
               </button>
             )}
          </div>
        </div>
      </header>

      {/* --- HERO SECTION (Dynamic) --- */}
      <div className="relative w-full h-[85vh] md:h-[95vh] overflow-hidden border-b-8 border-[#222]">
        
        {/* DYNAMIC BACKGROUND IMAGE */}
        <div className="absolute inset-0">
           <img 
             src={currentBackground} 
             alt="Hero Background" 
             className="w-full h-full object-cover object-top opacity-50 transition-opacity duration-1000 ease-in-out"
           />
           {/* Gradients for readability */}
           <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/80"></div>
           <div className="absolute inset-0 bg-gradient-to-r from-black via-black/20 to-transparent"></div>
        </div>

        {/* Hero Content Layer */}
        <div className="absolute inset-0 flex flex-col justify-center items-center text-center px-4 z-20">
           
           {/* LANDING PAGE MODE */}
           {!activeMovie ? (
             <div className="max-w-5xl space-y-8 animate-fade-in-up">
                <h1 className="text-5xl md:text-7xl font-black text-white drop-shadow-2xl leading-tight tracking-tight">
                  The Nexus of <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">Infinite Entertainment.</span>
                </h1>
                <p className="text-2xl md:text-3xl font-medium text-white drop-shadow-md">
                  Experience the future of streaming. AI-powered discovery connecting you to the stories you love.
                </p>
                <p className="text-lg md:text-xl font-normal text-gray-300">
                  Ready to watch? Enter your favorite genre or movie to start exploring.
                </p>

                {/* BIG CENTER SEARCH BAR with VOICE */}
                <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8 w-full max-w-3xl mx-auto relative">
                   <div className="relative w-full flex items-center">
                      <input 
                        type="text" 
                        placeholder="Search movies, genres (e.g. Sci-Fi, Avatar)..." 
                        value={heroSearchTerm}
                        onChange={(e) => setHeroSearchTerm(e.target.value)}
                        className="w-full h-16 px-6 rounded-full bg-black/60 border border-gray-500 text-white placeholder-gray-300 text-lg focus:outline-none focus:ring-2 focus:ring-red-600 backdrop-blur-md shadow-2xl"
                      />
                      {/* Voice Icon Inside Big Input */}
                      <div className="absolute right-6 scale-125">
                         <VoiceSearch onSearch={handleVoiceSearch} />
                      </div>
                   </div>
                   <button 
                     onClick={handleHeroSearch}
                     className="h-16 px-10 bg-red-600 text-white text-2xl font-bold rounded-full hover:bg-red-700 transition flex items-center gap-2 whitespace-nowrap shadow-[0_0_20px_rgba(220,38,38,0.5)]"
                   >
                     Get Started <ArrowRightIcon />
                   </button>
                </div>
             </div>
           ) : (
             // MOVIE DETAIL MODE (Active Movie)
             <div className="w-full text-left px-6 md:px-16 max-w-4xl mr-auto absolute left-0 top-[25%] animate-slide-in">
                <h1 className="text-6xl md:text-8xl font-black text-white drop-shadow-lg mb-4 leading-none tracking-tighter">
                  {activeMovie.title}
                </h1>
                
                <div className="flex items-center gap-4 text-lg font-bold text-gray-200 mb-6">
                    <span className="text-green-400">98% Match</span>
                    <span>{movieDetails?.Year}</span>
                    <span className="border border-gray-400 px-2 text-xs rounded">4K</span>
                    <span>{movieDetails?.Runtime}</span>
                </div>

                <p className="text-xl text-white drop-shadow-md line-clamp-3 mb-8 max-w-2xl leading-relaxed">
                  {movieDetails?.Plot}
                </p>

                <div className="flex gap-4 mb-8">
                  <button onClick={() => setIsPlaying(true)} className="bg-white text-black px-8 py-3 rounded-md font-bold text-xl flex items-center gap-3 hover:bg-gray-200 transition">
                    <PlayIcon /> Play
                  </button>
                  <button onClick={handleToggleList} className="bg-gray-600/80 text-white px-8 py-3 rounded-md font-bold text-xl flex items-center gap-3 hover:bg-gray-600 transition">
                    {isInList ? "✓ In Watchlist" : "+ My List"}
                  </button>
                </div>

                {/* AI Insight Card */}
                {activeMovie.explanation && (
                  <div className="inline-flex items-center gap-4 bg-black/80 border-l-4 border-yellow-500 pl-6 pr-8 py-4 backdrop-blur-xl rounded-r-xl shadow-2xl max-w-2xl transform hover:scale-105 transition duration-300">
                     <span className="text-4xl animate-pulse">⚡</span>
                     <div>
                        <p className="text-xs uppercase font-extrabold text-yellow-500 tracking-widest mb-1">StreamNexus AI Insight</p>
                        <p className="text-base font-medium text-white leading-snug">{activeMovie.explanation}</p>
                     </div>
                  </div>
                )}
             </div>
           )}
        </div>
      </div>

      {/* --- CONTENT ROWS --- */}
      <div className="bg-[#141414] pb-20 pt-10 relative z-40">
        {recommendations.length > 0 && <MovieRow title="🔥 Recommended For You" movies={recommendations} onMovieClick={handleMovieClick} isLoading={loading} />}
        {user && myList.length > 0 && <MovieRow title="☁️ Your Cloud Watchlist" movies={myList} onMovieClick={handleMovieClick} isLoading={false} />}
        <MovieRow title="Trending Now" movies={trending} onMovieClick={handleMovieClick} isLoading={loading} />
        <MovieRow title="Epic Adventures" movies={adventure} onMovieClick={handleMovieClick} isLoading={loading} />
        <MovieRow title="Comedy Hits" movies={comedy} onMovieClick={handleMovieClick} isLoading={loading} />
        <MovieRow title="Mind-Bending Sci-Fi" movies={scifi} onMovieClick={handleMovieClick} isLoading={loading} />
        <MovieRow title="Crime & Thrillers" movies={crime} onMovieClick={handleMovieClick} isLoading={loading} />
      </div>

      <footer className="py-16 text-center text-gray-500 text-sm bg-black border-t border-gray-900">
        <p className="mb-4">Questions? Call 000-800-919-1694</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left pl-10 md:pl-0 mb-8">
           <span className="hover:underline cursor-pointer">FAQ</span>
           <span className="hover:underline cursor-pointer">Help Centre</span>
           <span className="hover:underline cursor-pointer">Terms of Use</span>
           <span className="hover:underline cursor-pointer">Privacy</span>
        </div>
        <p className="font-mono opacity-50">ENGINEERED BY STREAMNEXUS AI • FINAL YEAR PROJECT</p>
      </footer>
    </div>
  );
}