import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setUser } from "../redux/authSlice"; 
import { toast } from "react-toastify";
import { AiOutlineUser, AiOutlineMail, AiOutlinePhone, AiOutlineEdit, AiOutlineSave } from "react-icons/ai";
import { MdOutlineReceiptLong } from "react-icons/md";

const EditableField = ({ icon: Icon, inputRef, defaultVal, placeholder, maxLength, onKeyDown, onChange, hasError, isEditing }) => (
  <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 transition-all ${
    isEditing ? "border-orange-400 bg-white dark:bg-gray-600 shadow-sm" : "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700"
  } ${hasError ? "!border-red-400" : ""}`}>
    <Icon className="text-gray-400 flex-shrink-0" size={18} />
    <input ref={inputRef} defaultValue={defaultVal} readOnly={!isEditing}
      placeholder={placeholder} maxLength={maxLength}
      onKeyDown={onKeyDown} onChange={onChange}
      className={`flex-1 text-sm outline-none bg-transparent text-gray-800 dark:text-white ${isEditing ? "cursor-text" : "cursor-default"}`} />
  </div>
);

const UserProfile = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const [editing, setEditing] = useState(false);
  const [nameError, setNameError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const nameRef  = useRef(null);
  const phoneRef = useRef(null);

  useEffect(() => {
    if (editing) {
      setTimeout(() => {
        if (nameRef.current) {
          nameRef.current.focus();
          const len = nameRef.current.value.length;
          nameRef.current.setSelectionRange(len, len);
        }
      }, 50);
    }
  }, [editing]);

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 dark:bg-gray-900">
        <AiOutlineUser size={70} className="text-gray-300 dark:text-gray-600 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-2">Please login first</h2>
        <button onClick={() => navigate("/")}
          className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-xl font-semibold transition mt-4">
          Go Home
        </button>
      </div>
    );
  }

  const allOrders = JSON.parse(localStorage.getItem("orderHistory") || "[]");
  const userOrders = allOrders.filter((o) => o.userEmail === user?.email);
  const totalSpent = userOrders.reduce((sum, o) => sum + parseFloat(o.total || 0), 0);
  const deliveredCount = userOrders.filter((o) => o.status === "Delivered").length;

  const handleSave = () => {
    const name  = nameRef.current?.value?.trim() || "";
    const phone = phoneRef.current?.value?.trim() || "";
    let valid = true;

    if (!name)                            { setNameError("Name is required"); valid = false; } else setNameError("");
    if (phone && !/^\d{10}$/.test(phone)) { setPhoneError("Enter valid 10-digit number"); valid = false; } else setPhoneError("");
    if (!valid) return;

    // Update in localStorage
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    localStorage.setItem("users", JSON.stringify(
      users.map((u) => u.email === user.email ? { ...u, name, phone } : u)
    ));

    // Update Redux 
    dispatch(setUser({ ...user, name, phone }));
    toast.success("Profile updated! ");
    setEditing(false);
  };

  const handleCancel = () => {
    if (nameRef.current)  nameRef.current.value  = user?.name  || "";
    if (phoneRef.current) phoneRef.current.value = user?.phone || "";
    setNameError(""); setPhoneError(""); setEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter")  handleSave();
    if (e.key === "Escape") handleCancel();
  };

  const avatarLetter = (user?.name || "U")[0].toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm">

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center text-white text-3xl font-bold flex-shrink-0">
              {avatarLetter}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800 dark:text-white">{user?.name}</h1>
              <p className="text-gray-500 dark:text-gray-400 text-sm">{user?.email}</p>
              <span className="inline-block mt-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-500 px-2 py-0.5 rounded-full font-medium">
                🍕 Food Lover
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Orders", value: userOrders.length, icon: "📦" },
              { label: "Total Spent",  value: `₹${totalSpent.toFixed(0)}`, icon: "💰" },
              { label: "Delivered",    value: deliveredCount, icon: "✅" },
            ].map(({ label, value, icon }) => (
              <div key={label} className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 text-center">
                <p className="text-xl mb-1">{icon}</p>
                <p className="font-bold text-gray-800 dark:text-white text-lg">{value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
              </div>
            ))}
          </div>

          {/* Editable Fields */}
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-gray-700 dark:text-white">Personal Info</h2>
              {!editing ? (
                <button onClick={() => setEditing(true)}
                  className="flex items-center gap-1 text-sm text-orange-500 hover:underline font-medium">
                  <AiOutlineEdit size={15} /> Edit
                </button>
              ) : (
                <button onClick={handleSave}
                  className="flex items-center gap-1 text-sm text-green-500 hover:underline font-medium">
                  <AiOutlineSave size={15} /> Save
                </button>
              )}
            </div>

            <div>
              <EditableField icon={AiOutlineUser} inputRef={nameRef} defaultVal={user?.name || ""}
                placeholder="Your full name" onKeyDown={handleKeyDown} onChange={() => setNameError("")}
                hasError={!!nameError} isEditing={editing} />
              {nameError && <p className="text-red-500 text-xs mt-1 ml-1">⚠️ {nameError}</p>}
            </div>

            <div className="flex items-center gap-3 border border-gray-200 dark:border-gray-600 rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-700 opacity-60">
              <AiOutlineMail className="text-gray-400 flex-shrink-0" size={18} />
              <input value={user?.email || ""} readOnly
                className="flex-1 text-sm bg-transparent outline-none text-gray-700 dark:text-white cursor-default" />
              <span className="text-xs text-gray-400 flex-shrink-0">Cannot change</span>
            </div>

            <div>
              <EditableField icon={AiOutlinePhone} inputRef={phoneRef} defaultVal={user?.phone || ""}
                placeholder="10-digit phone" maxLength={10} onKeyDown={handleKeyDown}
                onChange={() => setPhoneError("")} hasError={!!phoneError} isEditing={editing} />
              {phoneError && <p className="text-red-500 text-xs mt-1 ml-1">⚠️ {phoneError}</p>}
            </div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <button onClick={handleSave}
                  className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl text-sm font-semibold transition">
                  Save Changes ✅
                </button>
                <button onClick={handleCancel}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-white py-3 rounded-xl text-sm font-semibold transition">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm">
          <h2 className="font-bold text-gray-700 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => navigate("/orders")}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition">
              <MdOutlineReceiptLong size={22} className="text-orange-500" />
              <span className="text-sm font-medium text-gray-700 dark:text-white">My Orders</span>
            </button>
            <button onClick={() => navigate("/")}
              className="flex items-center gap-3 p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-orange-300 hover:bg-orange-50 dark:hover:bg-orange-900/10 transition">
              <span className="text-xl">🍕</span>
              <span className="text-sm font-medium text-gray-700 dark:text-white">Order Food</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
