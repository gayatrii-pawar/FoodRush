import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const NotFound = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(5);

  useEffect(() => {
    if (count <= 0) { navigate("/"); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl mb-6 animate-bounce">🍕</div>
        <h1 className="text-8xl font-extrabold text-orange-500 mb-2">404</h1>
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">
          Oops! Page Not Found
        </h2>
        <p className="text-gray-500 dark:text-gray-400 mb-2">
          Looks like this page got eaten! 😅
        </p>
        <p className="text-sm text-gray-400 dark:text-gray-500 mb-8">
          Redirecting to home in <span className="text-orange-500 font-bold">{count}</span> seconds...
        </p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate("/")}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-xl font-semibold transition shadow-lg">
            🏠 Go Home Now
          </button>
          <button onClick={() => navigate(-1)}
            className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-white px-6 py-3 rounded-xl font-semibold transition">
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
