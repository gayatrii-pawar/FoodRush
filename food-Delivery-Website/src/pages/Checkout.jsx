// ----saves orders to Firestore-------
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearCart } from "../redux/cartSlice";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineCheckCircle } from "react-icons/ai";
import { MdDeliveryDining } from "react-icons/md";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const Checkout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totalAmount } = useSelector((state) => state.cart);
  const { user } = useSelector((state) => state.auth);

  const [orderPlaced, setOrderPlaced] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [countdown, setCountdown] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);

  const savedAddresses = JSON.parse(localStorage.getItem(`addresses_${user?.email}`) || "[]");
  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0] || null;

  const [formData, setFormData] = useState({
    name: user?.name || "", phone: user?.phone || "", email: user?.email || "",
    address: defaultAddr?.line || "", city: defaultAddr?.city || "",
    pincode: defaultAddr?.pincode || "", paymentMethod: "cod",
  });

  useEffect(() => {
    if (countdown === null || countdown <= 0) return;
    const timer = setInterval(() => setCountdown((p) => p <= 1 ? (clearInterval(timer), 0) : p - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const formatTime = (s) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, "0")}`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: "" });
  };

  const validate = () => {
    const e = {};
    if (!formData.name.trim())              e.name    = "Name is required";
    if (!/^\d{10}$/.test(formData.phone))   e.phone   = "Valid 10-digit phone";
    if (!formData.email.includes("@"))      e.email   = "Valid email required";
    if (!formData.address.trim())           e.address = "Address is required";
    if (!formData.city.trim())              e.city    = "City is required";
    if (!/^\d{6}$/.test(formData.pincode))  e.pincode = "Valid 6-digit pincode";
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }

    setLoading(true);
    try {
      const total = (totalAmount * 1.05).toFixed(2);

      const orderData = {
        userEmail: user?.email,
        userName: user?.name,
        userId: user?.uid || null,
        items: items.map((i) => ({ id: i.id, name: i.name, image: i.image, price: i.price, quantity: i.quantity, totalPrice: i.totalPrice })),
        total,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        paymentMethod: formData.paymentMethod,
        status: "Preparing",
        createdAt: serverTimestamp(),
        date: new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }),
      };

      // -- Save to Firestore----------------
      const docRef = await addDoc(collection(db, "orders"), orderData);

      // ── Also save to localStorage for offline/profile view -------
      const localOrder = { ...orderData, id: docRef.id, createdAt: new Date().toISOString() };
      const existing = JSON.parse(localStorage.getItem("orderHistory") || "[]");
      localStorage.setItem("orderHistory", JSON.stringify([...existing, localOrder]));

      setOrderDetails({ ...formData, total, orderId: docRef.id });
      setOrderPlaced(true);
      setCountdown(35 * 60);
      dispatch(clearCart());
      toast.success("Order placed successfully! 🎉");
    } catch (err) {
      console.error("Order error:", err);
      toast.error("Failed to place order. Try again.");
    } finally {
      setLoading(false);
    }
  };

  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center dark:bg-gray-900">
        <p className="text-gray-600 dark:text-white text-lg mb-4">No items to checkout</p>
        <button onClick={() => navigate("/")} className="bg-orange-500 text-white px-6 py-3 rounded-xl">Go to Menu</button>
      </div>
    );
  }

  if (orderPlaced && orderDetails) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4 py-10">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl max-w-md w-full text-center">
          <AiOutlineCheckCircle size={70} className="text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-1">Order Confirmed! 🎉</h2>
          <p className="text-xs text-gray-400 mb-4">Order ID: #{orderDetails.orderId?.slice(-8).toUpperCase()}</p>

          <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-2xl p-5 mb-6">
            <MdDeliveryDining size={36} className="text-orange-500 mx-auto mb-2" />
            <p className="text-sm text-gray-500 mb-1">Estimated delivery in</p>
            {countdown > 0 ? (
              <>
                <p className="text-4xl font-extrabold text-orange-500">{formatTime(countdown)}</p>
                <p className="text-xs text-gray-400 mt-1">minutes remaining</p>
              </>
            ) : <p className="text-lg font-bold text-green-500">Your order has arrived! 🏠</p>}
            <div className="mt-4 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${100 - (countdown / (35 * 60)) * 100}%` }} />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Order placed</span><span>On the way</span><span>Delivered</span>
            </div>
          </div>

          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 text-left text-sm mb-6 space-y-1">
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold"> Address:</span> {orderDetails.address}, {orderDetails.city} - {orderDetails.pincode}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold"> Payment:</span>{" "}
              {orderDetails.paymentMethod === "cod" ? "Cash on Delivery" : orderDetails.paymentMethod === "upi" ? "UPI/GPay" : "Card"}
            </p>
            <p className="text-gray-600 dark:text-gray-300">
              <span className="font-semibold">💰 Total:</span> <span className="text-orange-500 font-bold">₹{orderDetails.total}</span>
            </p>
          </div>

          <div className="flex gap-3">
            <button onClick={() => navigate("/orders")}
              className="flex-1 border border-orange-500 text-orange-500 font-semibold py-3 rounded-xl hover:bg-orange-50 transition">
              View Orders 📦
            </button>
            <button onClick={() => navigate("/")}
              className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition">
              Order More 🍕
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8">Checkout 💳</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {defaultAddr && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl px-4 py-3 text-sm text-green-700 dark:text-green-400">
                 Default address auto-filled
              </div>
            )}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-4">📍 Delivery Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "name",    label: "Full Name",    placeholder: "John Doe",       type: "text" },
                  { name: "phone",   label: "Phone Number", placeholder: "9876543210",     type: "tel" },
                  { name: "email",   label: "Email",        placeholder: "john@email.com", type: "email", full: true },
                  { name: "address", label: "Full Address", placeholder: "Street, Area",   type: "text",  full: true },
                  { name: "city",    label: "City",         placeholder: "Pune",         type: "text" },
                  { name: "pincode", label: "Pincode",      placeholder: "400001",         type: "text" },
                ].map(({ name, label, placeholder, type, full }) => (
                  <div key={name} className={full ? "md:col-span-2" : ""}>
                    <label className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1 block">{label}</label>
                    <input type={type} name={name} placeholder={placeholder} value={formData[name]} onChange={handleChange}
                      className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white ${
                        errors[name] ? "border-red-400" : "border-gray-200 dark:border-gray-600 focus:border-orange-400"
                      }`} />
                    {errors[name] && <p className="text-red-500 text-xs mt-1">⚠️ {errors[name]}</p>}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">
              <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-4">💳 Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: "cod", label: "💵 Cash on Delivery" },
                  { value: "upi", label: "📱 UPI / GPay / PhonePe" },
                  { value: "card", label: "💳 Credit / Debit Card" },
                ].map(({ value, label }) => (
                  <label key={value} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition ${
                    formData.paymentMethod === value ? "border-orange-400 bg-orange-50 dark:bg-orange-900/20" : "border-gray-200 dark:border-gray-700 hover:border-orange-300"
                  }`}>
                    <input type="radio" name="paymentMethod" value={value}
                      checked={formData.paymentMethod === value} onChange={handleChange} className="accent-orange-500" />
                    <span className="text-gray-700 dark:text-white text-sm font-medium">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            <button onClick={handleSubmit} disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl transition shadow-lg flex items-center justify-center gap-2">
              {loading ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> Placing Order...</> : "Place Order 🎉"}
            </button>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm h-fit sticky top-6">
            <h2 className="font-bold text-gray-800 dark:text-white text-lg mb-4">Order Summary</h2>
            <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300 truncate max-w-[140px]">{item.name} × {item.quantity}</span>
                  <span className="font-semibold text-gray-800 dark:text-white">₹{item.totalPrice?.toFixed(2)}</span>
                </div>
              ))}
            </div>
            <hr className="border-gray-200 dark:border-gray-700 mb-4" />
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Subtotal</span><span>₹{totalAmount.toFixed(2)}</span></div>
              <div className="flex justify-between text-green-500"><span>Delivery</span><span>FREE 🎉</span></div>
              <div className="flex justify-between text-gray-600 dark:text-gray-300"><span>Tax (5%)</span><span>₹{(totalAmount * 0.05).toFixed(2)}</span></div>
              <hr className="border-gray-200 dark:border-gray-700" />
              <div className="flex justify-between font-bold text-gray-800 dark:text-white text-base">
                <span>Total</span><span className="text-orange-500">₹{(totalAmount * 1.05).toFixed(2)}</span>
              </div>
            </div>
            <div className="mt-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl p-3 text-center">
              <p className="text-sm text-orange-600 dark:text-orange-400 font-medium">🛵 Est. delivery: 30–45 min</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
