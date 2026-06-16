import { useState } from "react";
import { AiOutlineSearch, AiOutlineClose } from "react-icons/ai";

// Categories - update these to match your actual food categories
const CATEGORIES = ["All", "Pizza", "Burgers", "Sushi", "Pasta", "Desserts", "Drinks"];

const SearchFilter = ({ onSearch, onFilter, activeCategory }) => {
  const [searchTerm, setSearchTerm] = useState("");

  const handleSearch = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    onSearch(value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    onSearch("");
  };

  return (
    <div className="w-full space-y-4 py-6">
      {/* Search Bar */}
      <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-5 py-3 gap-3 shadow-sm focus-within:border-orange-400 focus-within:shadow-orange-100 transition-all max-w-xl mx-auto">
        <AiOutlineSearch className="text-gray-400" size={20} />
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search for food, cuisines..."
          className="bg-transparent outline-none flex-1 text-gray-700 dark:text-white text-sm"
        />
        {searchTerm && (
          <button onClick={clearSearch} className="text-gray-400 hover:text-red-400 transition">
            <AiOutlineClose size={16} />
          </button>
        )}
      </div>

      {/* Category Filter Pills */}
      <div className="flex gap-2 flex-wrap justify-center">
        {CATEGORIES.map((category) => (
          <button
            key={category}
            onClick={() => onFilter(category)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${
              activeCategory === category
                ? "bg-orange-500 text-white border-orange-500 shadow-md scale-105"
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-orange-400 hover:text-orange-500"
            }`}
          >
            {category}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SearchFilter;
