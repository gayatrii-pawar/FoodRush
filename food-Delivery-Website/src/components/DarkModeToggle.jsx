import { useDarkMode } from "../context/DarkModeContext";
import { BsSun, BsMoon } from "react-icons/bs";

const DarkModeToggle = () => {
  const { darkMode, toggleDarkMode } = useDarkMode();

  return (
    <button
      onClick={toggleDarkMode}
      className="relative w-14 h-7 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2"
      style={{ backgroundColor: darkMode ? "#f97316" : "#e5e7eb" }}
      aria-label="Toggle dark mode"
    >
      <span
        className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center transition-transform duration-300 ${
          darkMode ? "translate-x-7" : "translate-x-1"
        }`}
      >
        {darkMode ? (
          <BsMoon size={10} className="text-orange-500" />
        ) : (
          <BsSun size={10} className="text-yellow-500" />
        )}
      </span>
    </button>
  );
};

export default DarkModeToggle;
