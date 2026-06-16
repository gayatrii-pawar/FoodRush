import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { MdDeliveryDining, MdOutlineReceiptLong } from "react-icons/md";
import { AiOutlineClockCircle } from "react-icons/ai";

const OrderHistory = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => state.auth);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 dark:bg-gray-900">
        <MdOutlineReceiptLong size={70} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">Please login first</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Login to see your order history</p>
        <button onClick={() => navigate("/")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition">
          Go Home
        </button>
      </div>
    );
  }

  const allOrders = JSON.parse(localStorage.getItem("orderHistory") || "[]");
  const userOrders = allOrders.filter((o) => o.userEmail === user?.email).reverse();

  if (userOrders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 dark:bg-gray-900">
        <MdOutlineReceiptLong size={70} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">No orders yet</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Your order history will appear here</p>
        <button onClick={() => navigate("/")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition">
          Order Now 🍕
        </button>
      </div>
    );
  }

  const statusColor = {
    Delivered: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
    "On the way": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    Preparing: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">My Orders </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">{userOrders.length} orders placed</p>
        <div className="space-y-5">
          {userOrders.map((order, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-gray-800 dark:text-white text-sm">Order #{order.id}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                    <AiOutlineClockCircle size={12} />{order.date}
                  </p>
                </div>
                <span className={`text-xs font-semibold px-3 py-1 rounded-full ${statusColor[order.status]}`}>
                  {order.status === "Delivered" ? "✅" : order.status === "On the way" ? "🛵" : "👨‍🍳"} {order.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <img src={item.image} alt={item.name}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                      onError={(e) => { e.target.style.display = "none"; }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700 dark:text-gray-300 truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-white">₹{item.totalPrice?.toFixed(2)}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <MdDeliveryDining size={16} />
                  <span className="truncate max-w-[200px]">{order.address}, {order.city}</span>
                </div>
                <p className="font-bold text-orange-500">₹{order.total}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;
