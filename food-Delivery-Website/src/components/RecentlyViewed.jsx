import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AiOutlineClockCircle } from "react-icons/ai";

const RecentlyViewed = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);

  useEffect(() => {
    const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    setItems(recent);
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center gap-2 mb-4">
        <AiOutlineClockCircle size={20} className="text-orange-500" />
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Recently Viewed</h2>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
        {items.map((item) => (
          <button key={item.id} onClick={() => navigate(`/food/${item.id}`)}
            className="flex-shrink-0 w-36 bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group">
            <div className="h-24 overflow-hidden">
              <img src={item.image} alt={item.name}
                className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                onError={(e) => { e.target.style.display = "none"; }} />
            </div>
            <div className="p-2.5">
              <p className="text-xs font-semibold text-gray-700 dark:text-white truncate">{item.name}</p>
              <p className="text-xs text-orange-500 font-bold mt-0.5">₹{item.price}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RecentlyViewed;
