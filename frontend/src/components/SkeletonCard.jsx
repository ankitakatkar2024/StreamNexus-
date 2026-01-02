const SkeletonCard = () => {
  return (
    // Matches the exact size of MovieCard (w-[200px] h-[300px])
    <div className="min-w-[160px] md:min-w-[200px] h-[240px] md:h-[300px] bg-gray-800 rounded-lg animate-pulse flex flex-col space-y-2 relative border border-gray-700/50 overflow-hidden">
       
       {/* Shimmer Effect (Optional High-Tech Shine) */}
       <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>

       {/* Poster Placeholder */}
       <div className="w-full h-full bg-gray-700/50"></div>
    </div>
  );
};

export default SkeletonCard;