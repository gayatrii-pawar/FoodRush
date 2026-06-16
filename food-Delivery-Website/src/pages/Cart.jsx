import { useDispatch, useSelector } from "react-redux";
import { increaseQuantity, decreaseQuantity, removeFromCart, clearCart } from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineDelete, AiOutlineShoppingCart } from "react-icons/ai";
import { FiMinus, FiPlus } from "react-icons/fi";

const Cart = ({ onOpenAuth }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount, totalQuantity } = useSelector((state) => state.cart);
  const { isLoggedIn } = useSelector((state) => state.auth);

  const handleCheckout = () => {
    if (!isLoggedIn) {
      toast.warning("Please login to proceed to checkout! ");
      onOpenAuth();
      return;
    }
    navigate("/checkout");
  };

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 dark:bg-gray-900">
        <AiOutlineShoppingCart size={80} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">Your cart is empty</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Add some delicious food to get started!</p>
        <button
          onClick={() => navigate("/")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition"
        >
          Browse Menu
        </button>
      </div>
    );
  }

  // Estimated delivery time: base 20 min + 5 min per item (max 60 min)
  const estimatedMin = Math.min(20 + totalQuantity * 5, 60);
  const estimatedMax = estimatedMin + 10;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Your Cart 🛒
            <span className="ml-3 text-base font-normal text-orange-500">
              ({totalQuantity} {totalQuantity === 1 ? "item" : "items"})
            </span>
          </h1>
          <button
            onClick={() => dispatch(clearCart())}
            className="text-sm text-red-500 hover:underline font-medium"
          >
            Clear All
          </button>
        </div>

        {/* Delivery Time Banner */}
        <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-2xl px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-3xl">🛵</span>
          <div>
            <p className="font-semibold text-orange-700 dark:text-orange-400">
              Estimated Delivery Time: {estimatedMin}–{estimatedMax} minutes
            </p>
            <p className="text-sm text-orange-500 dark:text-orange-300">
              Your order will be freshly prepared and delivered hot!
            </p>
          </div>
        </div>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center gap-4 bg-white dark:bg-gray-800 rounded-2xl p-4 shadow-sm"
            >
              <img
                src={item.image}
                alt={item.name}
                onError={(e) => { e.target.style.display = 'none'; }}
                className="w-20 h-20 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-800 dark:text-white truncate">{item.name}</h3>
                <p className="text-orange-500 font-bold mt-1">₹{item.price}</p>
                <p className="text-xs text-gray-400 mt-1">🕐 20–30 min</p>
              </div>

              {/* Quantity Controls */}
              <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 rounded-xl px-2 py-1">
                <button
                  onClick={() => dispatch(decreaseQuantity(item.id))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-100 hover:text-orange-500 transition text-gray-600 dark:text-white"
                >
                  <FiMinus size={14} />
                </button>
                <span className="w-6 text-center font-semibold text-gray-800 dark:text-white text-sm">
                  {item.quantity}
                </span>
                <button
                  onClick={() => dispatch(increaseQuantity(item.id))}
                  className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-orange-100 hover:text-orange-500 transition text-gray-600 dark:text-white"
                >
                  <FiPlus size={14} />
                </button>
              </div>

              <p className="font-bold text-gray-800 dark:text-white w-20 text-right">
                ₹{item.totalPrice.toFixed(2)}
              </p>

              <button
                onClick={() => dispatch(removeFromCart(item.id))}
                className="text-gray-400 hover:text-red-500 transition ml-2"
              >
                <AiOutlineDelete size={20} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 dark:text-white mb-4">Order Summary</h2>
          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{totalAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-green-500 font-medium">FREE 🎉</span>
            </div>
            <div className="flex justify-between">
              <span>Taxes (5%)</span>
              <span>₹{(totalAmount * 0.05).toFixed(2)}</span>
            </div>
            <hr className="border-gray-200 dark:border-gray-700 my-3" />
            <div className="flex justify-between text-lg font-bold text-gray-800 dark:text-white">
              <span>Total</span>
              <span className="text-orange-500">₹{(totalAmount * 1.05).toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={handleCheckout}
            className="w-full mt-6 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-4 rounded-xl transition shadow-lg hover:shadow-orange-200 flex items-center justify-center gap-2"
          >
            {isLoggedIn ? "Proceed to Checkout →" : " Login to Checkout"}
          </button>

          {!isLoggedIn && (
            <p className="text-center text-xs text-gray-400 mt-2">
              You need to be logged in to place an order
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
