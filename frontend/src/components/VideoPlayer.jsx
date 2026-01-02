import { useEffect, useState, useRef } from "react";
import movieTrailer from "movie-trailer";
import ReactPlayer from "react-player";

const VideoPlayer = ({ movie, onClose }) => {
  const [trailerUrl, setTrailerUrl] = useState("");
  const [status, setStatus] = useState("searching"); // searching | playing | fallback
  const playerRef = useRef(null);

  useEffect(() => {
    // 1. Find the official trailer URL
    movieTrailer(movie.title)
      .then((url) => {
        if (url) {
          setTrailerUrl(url);
          setStatus("playing");
        } else {
          // If no trailer found, trigger fallback immediately
          setStatus("fallback");
        }
      })
      .catch(() => setStatus("fallback"));
  }, [movie]);

  // 2. The Smart Fallback Function
  // If the video fails to load (e.g. blocked by YouTube), this runs automatically
  const handlePlayerError = () => {
    console.warn("Embed blocked. Launching smart fallback...");
    setStatus("fallback");
    
    // Optional: Auto-open new tab if embed fails (Uncomment to enable auto-popup)
    // const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " trailer")}`;
    // window.open(searchUrl, "_blank");
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center animate-fade-in backdrop-blur-md">
      
      {/* Header */}
      <div className="absolute top-0 left-0 w-full p-6 z-50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onClose}
            className="text-white hover:text-red-500 bg-gray-800/50 p-3 rounded-full border border-gray-600 transition hover:scale-110"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-white font-bold tracking-wide uppercase text-sm">
            {status === "playing" ? "Now Streaming" : "Trailer Source"}
          </h2>
        </div>
      </div>

      {/* Main Player Area */}
      <div className="w-full h-full md:w-[85%] md:h-[85%] relative bg-black shadow-2xl rounded-xl overflow-hidden border border-gray-800 flex flex-col items-center justify-center">
        
        {status === "searching" && (
           <div className="flex flex-col items-center gap-4">
             <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
             <p className="text-gray-400 font-mono text-xs tracking-[0.2em] animate-pulse">ACQUIRING SIGNAL...</p>
           </div>
        )}

        {status === "playing" && trailerUrl && (
          <ReactPlayer 
            ref={playerRef}
            url={trailerUrl}
            width="100%"
            height="100%"
            playing={true}
            controls={true}
            // Smart Error Handling:
            onError={handlePlayerError}
            config={{
              youtube: {
                playerVars: { showinfo: 0, modestbranding: 1, rel: 0 }
              }
            }}
          />
        )}

        {status === "fallback" && (
          // This screen only appears if the embed was BLOCKED by YouTube
          <div className="text-center p-8 max-w-lg animate-fade-in-up">
             <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700 shadow-[0_0_30px_rgba(220,38,38,0.2)]">
                <svg className="w-10 h-10 text-red-500" fill="currentColor" viewBox="0 0 24 24"><path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/></svg>
             </div>
             
             <h3 className="text-2xl text-white font-bold mb-2">Restricted Access</h3>
             <p className="text-gray-400 mb-8 text-sm leading-relaxed">
               The studio has blocked embedded playback for <span className="text-white">"{movie.title}"</span> on 3rd party apps. 
               <br/>Please authenticate viewing on the source platform.
             </p>
             
             <a 
               href={`https://www.youtube.com/results?search_query=${encodeURIComponent(movie.title + " official trailer")}`}
               target="_blank" 
               rel="noopener noreferrer"
               className="group relative inline-flex items-center justify-center px-8 py-3 font-bold text-white transition-all duration-200 bg-red-600 font-lg rounded-full hover:bg-red-700 hover:scale-105 focus:outline-none ring-offset-2 focus:ring-2"
               onClick={onClose}
             >
               <span>Launch Source Player</span>
               <svg className="w-5 h-5 ml-2 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
             </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoPlayer;