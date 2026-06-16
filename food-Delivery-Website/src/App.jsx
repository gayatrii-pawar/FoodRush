
import { useState, useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { Provider, useDispatch, useSelector } from "react-redux";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";

import store from "./redux/store";
import { DarkModeProvider } from "./context/DarkModeContext";
import { clearUser } from "./redux/authSlice";
import { addToCart } from "./redux/cartSlice";
import { allFoodsData } from "./data/foods";

import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderHistory from "./pages/OrderHistory";
import UserProfile from "./pages/UserProfile";
import NotFound from "./pages/NotFound";
import FoodDetail from "./pages/FoodDetail";
import AddressManager from "./pages/AddressManager";
import AuthModal from "./components/AuthModal";
import DarkModeToggle from "./components/DarkModeToggle";
import SearchFilter from "./components/SearchFilter";
import SkeletonCard from "./components/SkeletonCard";
import RecentlyViewed from "./components/RecentlyViewed";
import BackToTop from "./components/BackToTop";

import { AiOutlineShoppingCart, AiOutlineUser, AiOutlineHeart, AiFillHeart } from "react-icons/ai";
import { MdOutlineReceiptLong } from "react-icons/md";
import { HiMenu, HiX } from "react-icons/hi";
import { auth } from "./firebase";
import { signOut } from "firebase/auth";

// Page Transition
const PageWrapper = ({ children }) => {
  const location = useLocation();
  const [show, setShow] = useState(false);
  useEffect(() => {
    setShow(false);
    const t = setTimeout(() => setShow(true), 50);
    return () => clearTimeout(t);
  }, [location.pathname]);
  return (
    <div className={`transition-all duration-300 ${show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3"}`}>
      {children}
    </div>
  );
};

// Protected Route
const ProtectedRoute = ({ children, onOpenAuth }) => {
  const { isLoggedIn } = useSelector((s) => s.auth);
  if (!isLoggedIn) { onOpenAuth(); return <Navigate to="/" replace />; }
  return children;
};

// Navbar
const Navbar = ({ onOpenAuth }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((s) => s.auth);
  const { totalQuantity } = useSelector((s) => s.cart);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropRef = useRef();

  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdownOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      dispatch(clearUser());
      setDropdownOpen(false);
      toast.info("Logged out successfully");
      navigate("/");
    } catch (err) {
      toast.error("Logout failed");
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-40 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold text-orange-500">🍕 FoodRush</Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 transition">Home</Link>
          <Link to="/orders" className="text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-orange-500 transition">Orders</Link>
        </div>

        <div className="flex items-center gap-3">
          <DarkModeToggle />
          <button onClick={() => navigate("/cart")} className="relative p-2 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-800 transition">
            <AiOutlineShoppingCart size={24} className="text-gray-700 dark:text-white" />
            {totalQuantity > 0 && (
              <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold animate-bounce">
                {totalQuantity}
              </span>
            )}
          </button>

          {isLoggedIn ? (
            <div className="relative" ref={dropRef}>
              <button onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 bg-orange-50 dark:bg-gray-800 hover:bg-orange-100 dark:hover:bg-gray-700 px-3 py-2 rounded-xl transition">
                <div className="w-7 h-7 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                  {(user?.name || "U")[0].toUpperCase()}
                </div>
                <span className="hidden sm:block text-sm font-medium text-gray-700 dark:text-white max-w-[80px] truncate">
                  {user?.name}
                </span>
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden z-50">
                  {[
                    { icon: <AiOutlineUser size={16} />, label: "My Profile", path: "/profile" },
                    { icon: <MdOutlineReceiptLong size={16} />, label: "My Orders", path: "/orders" },
                  ].map(({ icon, label, path }) => (
                    <button key={path} onClick={() => { navigate(path); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-700 transition">
                      {icon} {label}
                    </button>
                  ))}
                  <hr className="border-gray-100 dark:border-gray-700" />
                  <button onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition">
                    🚪 Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={onOpenAuth}
              className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-xl text-sm font-semibold transition">
              <AiOutlineUser size={16} /> Login
            </button>
          )}

          <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition">
            {menuOpen ? <HiX size={22} className="text-gray-700 dark:text-white" /> : <HiMenu size={22} className="text-gray-700 dark:text-white" />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 px-4 py-3 space-y-1">
          {["/", "/orders", ...(isLoggedIn ? ["/profile"] : [])].map((path) => (
            <Link key={path} to={path} onClick={() => setMenuOpen(false)}
              className="block py-2.5 px-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-orange-50 dark:hover:bg-gray-800 hover:text-orange-500 transition">
              {path === "/" ? "🏠 Home" : path === "/orders" ? "📦 My Orders" : "👤 Profile"}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

// Food Card
const FoodCard = ({ food, onOpenAuth }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn } = useSelector((s) => s.auth);
  const [imgError, setImgError] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const [wishlisted, setWishlisted] = useState(() => {
    const w = JSON.parse(localStorage.getItem("wishlist") || "[]");
    return w.includes(food.id);
  });

  const toggleWishlist = (e) => {
    e.stopPropagation();
    const w = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const updated = wishlisted ? w.filter((i) => i !== food.id) : [...w, food.id];
    localStorage.setItem("wishlist", JSON.stringify(updated));
    setWishlisted(!wishlisted);
    toast.success(wishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
      <div className="relative overflow-hidden h-44 bg-gray-100 dark:bg-gray-700 cursor-pointer"
        onClick={() => navigate(`/food/${food.id}`)}
        onMouseEnter={() => setZoomed(true)}
        onMouseLeave={() => setZoomed(false)}>
        {!imgError ? (
          <img src={food.image} alt={food.name} onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 ${zoomed ? "scale-125" : "scale-100"}`} />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
        )}
        <span className="absolute top-3 right-3 bg-white/90 dark:bg-gray-900/90 text-yellow-500 text-xs font-bold px-2 py-1 rounded-full shadow">
          ⭐ {food.rating}
        </span>
        <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full">
          {food.category}
        </span>
        <button onClick={toggleWishlist}
          className="absolute bottom-3 right-3 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow flex items-center justify-center transition hover:scale-110">
          {wishlisted ? <AiFillHeart size={16} className="text-red-500" /> : <AiOutlineHeart size={16} className="text-gray-400" />}
        </button>
      </div>
      <div className="p-4">
        <h3 onClick={() => navigate(`/food/${food.id}`)}
          className="font-semibold text-gray-800 dark:text-white mb-1 truncate cursor-pointer hover:text-orange-500 transition">
          {food.name}
        </h3>
        <p className="text-xs text-gray-400 mb-3">🕐 {food.prepTime || "20-30 min"} delivery</p>
        <div className="flex items-center justify-between">
          <span className="font-bold text-orange-500 text-lg">₹{food.price}</span>
          <button
            onClick={() => {
              if (!isLoggedIn) { toast.warning("Please login to add items! 🔐"); onOpenAuth(); return; }
              dispatch(addToCart(food));
            }}
            className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-sm px-4 py-2 rounded-xl font-medium transition-all duration-200">
            Add +
          </button>
        </div>
      </div>
    </div>
  );
};

// -----------Home Page------------------
const Home = ({ onOpenAuth }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(t);
  }, []);

  const filtered = allFoodsData.filter((f) => {
    const matchSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCat = activeCategory === "All" || f.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {!loading && <RecentlyViewed />}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 dark:text-white mb-2">
            Delicious food, <span className="text-orange-500">delivered fast 🚀</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400">Order from the best restaurants near you</p>
        </div>

        <SearchFilter onSearch={setSearchTerm} onFilter={setActiveCategory} activeCategory={activeCategory} />

        {!loading && (
          <p className="text-sm text-gray-400 mb-4">
            Showing {filtered.length} items
            {activeCategory !== "All" && ` in "${activeCategory}"`}
            {searchTerm && ` for "${searchTerm}"`}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
            : filtered.length === 0
            ? (
              <div className="col-span-full text-center py-16">
                <p className="text-5xl mb-4">🔍</p>
                <p className="text-xl text-gray-500 dark:text-gray-400">No food found</p>
                <button onClick={() => { setSearchTerm(""); setActiveCategory("All"); }}
                  className="mt-4 text-orange-500 hover:underline text-sm">Clear filters</button>
              </div>
            )
            : filtered.map((food) => <FoodCard key={food.id} food={food} onOpenAuth={onOpenAuth} />)
          }
        </div>
      </div>
    </div>
  );
};

//---------- App Content------------
const AppContent = () => {
  const [showAuth, setShowAuth] = useState(false);
  const openAuth = () => setShowAuth(true);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navbar onOpenAuth={openAuth} />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      <PageWrapper>
        <Routes>
          <Route path="/"          element={<Home onOpenAuth={openAuth} />} />
          <Route path="/food/:id"  element={<FoodDetail onOpenAuth={openAuth} />} />
          <Route path="/cart"      element={<Cart onOpenAuth={openAuth} />} />
          <Route path="/checkout"  element={<ProtectedRoute onOpenAuth={openAuth}><Checkout /></ProtectedRoute>} />
          <Route path="/orders"    element={<OrderHistory />} />
          <Route path="/profile"   element={<UserProfile />} />
          <Route path="/addresses" element={<AddressManager />} />
          <Route path="*"          element={<NotFound />} />
        </Routes>
      </PageWrapper>
      <BackToTop />
      <ToastContainer position="bottom-right" autoClose={2500} theme="colored" />
    </div>
  );
};

const App = () => (
  <Provider store={store}>
    <DarkModeProvider>
      <Router>
        <AppContent />
      </Router>
    </DarkModeProvider>
  </Provider>
);

export default App;
