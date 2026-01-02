import { useEffect, useState } from "react";
// You'll need to add getAnalytics to api.js (see Step 4)
import { getAnalytics } from "../api"; 
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const COLORS = ["#EF4444", "#3B82F6", "#10B981", "#F59E0B", "#8B5CF6"]; 

const AdminDashboard = ({ onClose }) => {
  const [data, setData] = useState(null);

  useEffect(() => {
    async function fetchData() {
      // Small delay to simulate "Real Time" fetching
      const result = await getAnalytics();
      setData(result);
    }
    fetchData();
    
    // Optional: Refresh data every 2 seconds for "Live" feel
    const interval = setInterval(async () => {
        const result = await getAnalytics();
        setData(result);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  if (!data) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl overflow-y-auto animate-fade-in p-6 md:p-12">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-10 border-b border-gray-800 pb-6">
        <div>
           <h2 className="text-4xl font-extrabold text-white tracking-tight">
             COMMAND <span className="text-red-600">CENTER</span>
           </h2>
           <p className="text-gray-400 text-sm mt-1 uppercase tracking-widest">Real-time Analytics</p>
        </div>
        <button onClick={onClose} className="text-white hover:text-red-500 text-2xl font-bold">✕ ESC</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-7xl mx-auto">
        
        {/* KPI CARD */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-2xl col-span-1 md:col-span-2 flex items-center justify-between">
            <div>
                <h3 className="text-gray-400 font-bold uppercase text-xs">Total Interactions</h3>
                <p className="text-5xl font-extrabold text-white mt-2">{data.total_interactions}</p>
            </div>
            <div className="h-4 w-4 rounded-full bg-green-500 animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.8)]"></div>
        </div>

        {/* CHART 1: TOP MOVIES */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-2xl">
          <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">Top Viewed Content</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.top_movies}>
                <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} interval={0} />
                <YAxis stroke="#666" fontSize={12} tickLine={false} allowDecimals={false} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }}
                    itemStyle={{ color: '#fff' }}
                    cursor={{fill: '#ffffff10'}}
                />
                <Bar dataKey="views" fill="#EF4444" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CHART 2: GENRES */}
        <div className="bg-gray-900 border border-gray-800 p-6 rounded-2xl shadow-2xl">
          <h3 className="text-white font-bold mb-6 text-sm uppercase tracking-wider">User Preferences</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.top_genres}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {data.top_genres.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Custom Legend */}
            <div className="flex flex-wrap justify-center gap-4 mt-4">
                {data.top_genres.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-xs text-gray-400">{entry.name}</span>
                    </div>
                ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;