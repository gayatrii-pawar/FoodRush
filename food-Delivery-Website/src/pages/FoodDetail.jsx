import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { addToCart } from "../redux/cartSlice";
import { allFoodsData } from "../data/foods";
import { toast } from "react-toastify";
import { AiOutlineArrowLeft, AiOutlineHeart, AiFillHeart, AiOutlineClockCircle } from "react-icons/ai";
import { MdLocalFireDepartment, MdOutlineRestaurant } from "react-icons/md";
import { FiMinus, FiPlus } from "react-icons/fi";

const FoodDetail = ({ onOpenAuth }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  const food = allFoodsData.find((f) => f.id === parseInt(id));
  const [quantity, setQuantity] = useState(1);
  const [wishlist, setWishlist] = useState(() => JSON.parse(localStorage.getItem("wishlist") || "[]"));
  const [isWishlisted, setIsWishlisted] = useState(wishlist.includes(parseInt(id)));
  const [activeTab, setActiveTab] = useState("about");
  const [reviews, setReviews] = useState(() => JSON.parse(localStorage.getItem(`reviews_${id}`) || "[]"));
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [imgZoomed, setImgZoomed] = useState(false);

  // Save to recently viewed
  useEffect(() => {
    if (!food) return;
    const recent = JSON.parse(localStorage.getItem("recentlyViewed") || "[]");
    const filtered = recent.filter((r) => r.id !== food.id);
    const updated = [{ id: food.id, name: food.name, image: food.image, price: food.price, category: food.category }, ...filtered].slice(0, 6);
    localStorage.setItem("recentlyViewed", JSON.stringify(updated));
  }, [food]);

  if (!food) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center dark:bg-gray-900">
        <p className="text-5xl mb-4">🍽️</p>
        <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-4">Food not found</h2>
        <button onClick={() => navigate("/")} className="bg-orange-500 text-white px-6 py-3 rounded-xl">Back to Menu</button>
      </div>
    );
  }

  const toggleWishlist = () => {
    const updated = isWishlisted ? wishlist.filter((i) => i !== food.id) : [...wishlist, food.id];
    setWishlist(updated);
    setIsWishlisted(!isWishlisted);
    localStorage.setItem("wishlist", JSON.stringify(updated));
    toast.success(isWishlisted ? "Removed from wishlist" : "Added to wishlist ❤️");
  };

  const handleAddToCart = () => {
    if (!isLoggedIn) { toast.warning("Please login first! 🔐"); onOpenAuth(); return; }
    for (let i = 0; i < quantity; i++) dispatch(addToCart(food));
    toast.success(`${quantity} × ${food.name} added to cart! 🛒`);
  };

  const submitReview = () => {
    if (!isLoggedIn) { toast.warning("Please login to review! 🔐"); onOpenAuth(); return; }
    if (!userRating) { toast.error("Please select a rating"); return; }
    if (!reviewText.trim()) { toast.error("Please write a review"); return; }
    const newReview = {
      id: Date.now(), name: user?.name || "You", rating: userRating,
      text: reviewText.trim(), date: new Date().toLocaleDateString("en-IN"),
    };
    const updated = [newReview, ...reviews];
    setReviews(updated);
    localStorage.setItem(`reviews_${id}`, JSON.stringify(updated));
    setUserRating(0); setReviewText("");
    toast.success("Review submitted! ⭐");
  };

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : food.rating;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-32">
      {/* Back button */}
      <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 px-4 py-3">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-orange-500 transition font-medium">
          <AiOutlineArrowLeft size={20} /> Back
        </button>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

          {/* ── Image with zoom ── */}
          <div className="relative">
            <div
              className={`overflow-hidden rounded-3xl shadow-lg cursor-zoom-in transition-all duration-300 ${imgZoomed ? "scale-105" : ""}`}
              onMouseEnter={() => setImgZoomed(true)}
              onMouseLeave={() => setImgZoomed(false)}
            >
              <img
                src={food.image} alt={food.name}
                className={`w-full h-80 object-cover transition-transform duration-500 ${imgZoomed ? "scale-125" : "scale-100"}`}
              />
            </div>
            {/* Wishlist */}
            <button onClick={toggleWishlist}
              className="absolute top-4 right-4 w-10 h-10 bg-white dark:bg-gray-800 rounded-full shadow-md flex items-center justify-center transition hover:scale-110">
              {isWishlisted
                ? <AiFillHeart size={20} className="text-red-500" />
                : <AiOutlineHeart size={20} className="text-gray-400" />}
            </button>
            {/* Tags */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {food.tags.map((tag) => (
                <span key={tag} className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 px-3 py-1 rounded-full font-medium">
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* ── Details ── */}
          <div>
            <span className="text-xs text-orange-500 font-semibold uppercase tracking-wider">{food.category}</span>
            <h1 className="text-3xl font-extrabold text-gray-800 dark:text-white mt-1 mb-2">{food.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex">
                {[1,2,3,4,5].map((s) => (
                  <span key={s} className={`text-lg ${s <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                ))}
              </div>
              <span className="font-bold text-gray-700 dark:text-white">{avgRating}</span>
              <span className="text-sm text-gray-400">({reviews.length > 0 ? reviews.length : food.ratingCount} reviews)</span>
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { icon: <AiOutlineClockCircle size={18} />, label: "Prep Time", value: food.prepTime },
                { icon: <MdLocalFireDepartment size={18} />, label: "Calories", value: `${food.calories} kcal` },
                { icon: <MdOutlineRestaurant size={18} />, label: "Category", value: food.category },
              ].map(({ icon, label, value }) => (
                <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-3 text-center">
                  <div className="text-orange-500 flex justify-center mb-1">{icon}</div>
                  <p className="text-xs text-gray-400">{label}</p>
                  <p className="text-xs font-semibold text-gray-700 dark:text-white">{value}</p>
                </div>
              ))}
            </div>

            {/* Price */}
            <div className="flex items-center gap-3 mb-5">
              <span className="text-3xl font-extrabold text-orange-500">₹{food.price}</span>
              <span className="text-sm text-gray-400 line-through">₹{Math.round(food.price * 1.2)}</span>
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">20% OFF</span>
            </div>

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-5">
              <div className="flex items-center gap-3 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-100 hover:text-orange-500 transition">
                  <FiMinus size={16} />
                </button>
                <span className="w-6 text-center font-bold text-gray-800 dark:text-white">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)}
                  className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-orange-100 hover:text-orange-500 transition">
                  <FiPlus size={16} />
                </button>
              </div>
              <span className="text-sm text-gray-500 dark:text-gray-400">Total: <span className="font-bold text-orange-500">₹{food.price * quantity}</span></span>
            </div>

            <button onClick={handleAddToCart}
              className="w-full bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold py-4 rounded-2xl text-lg transition-all shadow-lg shadow-orange-200 dark:shadow-none">
              Add to Cart 🛒
            </button>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mt-10">
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-6 w-fit">
            {["about", "ingredients", "reviews"].map((t) => (
              <button key={t} onClick={() => setActiveTab(t)}
                className={`px-5 py-2 rounded-lg text-sm font-semibold capitalize transition ${
                  activeTab === t ? "bg-white dark:bg-gray-700 text-orange-500 shadow" : "text-gray-500 dark:text-gray-400"
                }`}>
                {t} {t === "reviews" && `(${reviews.length})`}
              </button>
            ))}
          </div>

          {/* About */}
          {activeTab === "about" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{food.description}</p>
            </div>
          )}

          {/* Ingredients */}
          {activeTab === "ingredients" && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
              <div className="flex flex-wrap gap-3">
                {food.ingredients.map((ing) => (
                  <span key={ing} className="flex items-center gap-1 bg-orange-50 dark:bg-gray-700 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-medium">
                    ✓ {ing}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Reviews */}
          {activeTab === "reviews" && (
            <div className="space-y-4">
              {/* Write review */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6">
                <h3 className="font-bold text-gray-800 dark:text-white mb-3">Write a Review</h3>
                {/* Star selector */}
                <div className="flex gap-1 mb-3">
                  {[1,2,3,4,5].map((s) => (
                    <button key={s}
                      onMouseEnter={() => setHoverRating(s)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setUserRating(s)}
                      className={`text-3xl transition-transform hover:scale-125 ${
                        s <= (hoverRating || userRating) ? "text-yellow-400" : "text-gray-300"
                      }`}>★</button>
                  ))}
                  {userRating > 0 && <span className="ml-2 text-sm text-gray-500 self-center">{["","Poor","Fair","Good","Great","Excellent"][userRating]}</span>}
                </div>
                <textarea value={reviewText} onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience..."
                  className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm outline-none bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-white resize-none focus:border-orange-400 transition"
                  rows={3} />
                <button onClick={submitReview}
                  className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition">
                  Submit Review ⭐
                </button>
              </div>

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-2">💬</p>
                  <p>No reviews yet. Be the first!</p>
                </div>
              ) : (
                reviews.map((r) => (
                  <div key={r.id} className="bg-white dark:bg-gray-800 rounded-2xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold">
                          {r.name[0].toUpperCase()}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-white text-sm">{r.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{r.date}</span>
                    </div>
                    <div className="flex mb-2">
                      {[1,2,3,4,5].map((s) => (
                        <span key={s} className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-gray-300"}`}>★</span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300">{r.text}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FoodDetail;
