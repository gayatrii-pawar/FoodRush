import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { AiOutlineHome, AiOutlinePlus, AiOutlineDelete, AiOutlineEdit } from "react-icons/ai";
import { MdOutlineWork, MdOutlineLocationOn } from "react-icons/md";

const ICONS = { Home: AiOutlineHome, Work: MdOutlineWork, Other: MdOutlineLocationOn };
const TYPES = ["Home", "Work", "Other"];

const AddressManager = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const storageKey = `addresses_${user?.email}`;

  const [addresses, setAddresses] = useState(() => JSON.parse(localStorage.getItem(storageKey) || "[]"));
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [selectedType, setSelectedType] = useState("Home");
  const [errors, setErrors] = useState({});

  const nameRef    = useRef();
  const phoneRef   = useRef();
  const lineRef    = useRef();
  const cityRef    = useRef();
  const stateRef   = useRef();
  const pincodeRef = useRef();

  const save = (updated) => {
    setAddresses(updated);
    localStorage.setItem(storageKey, JSON.stringify(updated));
  };

  const handleSubmit = () => {
    const newErrors = {};
    const name    = nameRef.current?.value?.trim();
    const phone   = phoneRef.current?.value?.trim();
    const line    = lineRef.current?.value?.trim();
    const city    = cityRef.current?.value?.trim();
    const state   = stateRef.current?.value?.trim();
    const pincode = pincodeRef.current?.value?.trim();

    if (!name)                       newErrors.name    = "Name required";
    if (!/^\d{10}$/.test(phone))     newErrors.phone   = "Valid 10-digit phone";
    if (!line)                       newErrors.line    = "Address required";
    if (!city)                       newErrors.city    = "City required";
    if (!state)                      newErrors.state   = "State required";
    if (!/^\d{6}$/.test(pincode))    newErrors.pincode = "Valid 6-digit pincode";

    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    const entry = { id: editId || Date.now(), type: selectedType, name, phone, line, city, state, pincode };
    const updated = editId
      ? addresses.map((a) => a.id === editId ? entry : a)
      : [...addresses, entry];

    save(updated);
    toast.success(editId ? "Address updated! " : "Address added! 📍");
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false); setEditId(null);
    setSelectedType("Home"); setErrors({});
  };

  const handleEdit = (addr) => {
    setEditId(addr.id); setSelectedType(addr.type); setShowForm(true);
    setTimeout(() => {
      if (nameRef.current)    nameRef.current.value    = addr.name;
      if (phoneRef.current)   phoneRef.current.value   = addr.phone;
      if (lineRef.current)    lineRef.current.value    = addr.line;
      if (cityRef.current)    cityRef.current.value    = addr.city;
      if (stateRef.current)   stateRef.current.value   = addr.state;
      if (pincodeRef.current) pincodeRef.current.value = addr.pincode;
    }, 50);
  };

  const handleDelete = (id) => {
    save(addresses.filter((a) => a.id !== id));
    toast.error("Address removed");
  };

  const setDefault = (id) => {
    const updated = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    save(updated); toast.success("Default address set! ");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center dark:bg-gray-900 text-center px-4">
        <MdOutlineLocationOn size={70} className="text-gray-300 mb-4" />
        <h2 className="text-2xl font-bold text-gray-700 dark:text-white mb-4">Please login first</h2>
        <button onClick={() => navigate("/")} className="bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold">Go Home</button>
      </div>
    );
  }

  const InputField = ({ refProp, placeholder, type = "text", maxLength, errorKey }) => (
    <div>
      <input ref={refProp} type={type} placeholder={placeholder} maxLength={maxLength}
        onChange={() => setErrors((p) => ({ ...p, [errorKey]: "" }))}
        className={`w-full px-4 py-3 rounded-xl border text-sm outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-white transition ${
          errors[errorKey] ? "border-red-400" : "border-gray-200 dark:border-gray-600 focus:border-orange-400"
        }`} />
      {errors[errorKey] && <p className="text-red-500 text-xs mt-1">⚠️ {errors[errorKey]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">My Addresses </h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">{addresses.length} saved addresses</p>
          </div>
          <button onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition">
            <AiOutlinePlus size={18} /> Add New
          </button>
        </div>

        {/* Add / Edit Form */}
        {showForm && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm mb-6 border-2 border-orange-200 dark:border-orange-800">
            <h2 className="font-bold text-gray-800 dark:text-white mb-4">
              {editId ? "Edit Address" : "Add New Address"}
            </h2>

            {/* Type selector */}
            <div className="flex gap-2 mb-4">
              {TYPES.map((t) => {
                const Icon = ICONS[t];
                return (
                  <button key={t} onClick={() => setSelectedType(t)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium border transition ${
                      selectedType === t
                        ? "bg-orange-500 text-white border-orange-500"
                        : "border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:border-orange-300"
                    }`}>
                    <Icon size={15} /> {t}
                  </button>
                );
              })}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <InputField refProp={nameRef}    placeholder="Full Name"           errorKey="name" />
              <InputField refProp={phoneRef}   placeholder="Phone Number"  type="tel" maxLength={10} errorKey="phone" />
              <div className="sm:col-span-2">
                <InputField refProp={lineRef}  placeholder="Flat, Street, Area"  errorKey="line" />
              </div>
              <InputField refProp={cityRef}    placeholder="City"                errorKey="city" />
              <InputField refProp={stateRef}   placeholder="State"               errorKey="state" />
              <InputField refProp={pincodeRef} placeholder="Pincode"  maxLength={6} errorKey="pincode" />
            </div>

            <div className="flex gap-3 mt-4">
              <button onClick={handleSubmit}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-xl font-semibold transition">
                {editId ? "Update Address" : "Save Address"} 
              </button>
              <button onClick={resetForm}
                className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-white py-3 rounded-xl font-semibold transition">
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Address List */}
        {addresses.length === 0 && !showForm ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl">
            <p className="text-5xl mb-3">📭</p>
            <p className="text-gray-500 dark:text-gray-400">No addresses saved yet</p>
            <button onClick={() => setShowForm(true)}
              className="mt-4 bg-orange-500 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">
              Add Your First Address
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {addresses.map((addr) => {
              const Icon = ICONS[addr.type] || MdOutlineLocationOn;
              return (
                <div key={addr.id}
                  className={`bg-white dark:bg-gray-800 rounded-2xl p-5 shadow-sm border-2 transition ${
                    addr.isDefault ? "border-orange-400" : "border-transparent"
                  }`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
                        <Icon size={20} className="text-orange-500" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-800 dark:text-white text-sm">{addr.type}</span>
                          {addr.isDefault && (
                            <span className="text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-500 px-2 py-0.5 rounded-full font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">{addr.name} · {addr.phone}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{addr.line}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{addr.city}, {addr.state} - {addr.pincode}</p>
                      </div>
                    </div>
                    <div className="flex gap-2 flex-shrink-0">
                      <button onClick={() => handleEdit(addr)}
                        className="p-2 rounded-xl hover:bg-orange-50 dark:hover:bg-gray-700 text-orange-500 transition">
                        <AiOutlineEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(addr.id)}
                        className="p-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 transition">
                        <AiOutlineDelete size={18} />
                      </button>
                    </div>
                  </div>
                  {!addr.isDefault && (
                    <button onClick={() => setDefault(addr.id)}
                      className="mt-3 text-xs text-orange-500 hover:underline font-medium">
                      Set as Default
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AddressManager;
