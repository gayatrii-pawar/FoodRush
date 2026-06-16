import { useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setUser } from "../redux/authSlice";
import { auth } from "../firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import {
  AiOutlineClose, AiOutlineMail, AiOutlineLock,
  AiOutlineUser, AiOutlinePhone, AiOutlineEye, AiOutlineEyeInvisible,
} from "react-icons/ai";
import { toast } from "react-toastify";

const AuthModal = ({ onClose }) => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState("login"); // login | signup | forgot
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [resetSent, setResetSent] = useState(false);

  const loginEmailRef  = useRef();
  const loginPassRef   = useRef();
  const signupNameRef  = useRef();
  const signupPhoneRef = useRef();
  const signupEmailRef = useRef();
  const signupPassRef  = useRef();
  const forgotEmailRef = useRef();

  const setErr = (k, v) => setErrors((p) => ({ ...p, [k]: v }));
  const clearErr = (k) => setErrors((p) => ({ ...p, [k]: "" }));

  // ---LOGIN --------
  const handleLogin = async () => {
    const email    = loginEmailRef.current?.value?.trim() || "";
    const password = loginPassRef.current?.value || "";
    let valid = true;
    if (!email.includes("@")) { setErr("lemail", "Enter valid email"); valid = false; } else clearErr("lemail");
    if (password.length < 6)  { setErr("lpass", "Min 6 characters"); valid = false; }  else clearErr("lpass");
    if (!valid) return;

    setLoading(true);
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const user = result.user;
      dispatch(setUser({ uid: user.uid, name: user.displayName, email: user.email, phone: user.phoneNumber }));
      toast.success(`Welcome back, ${user.displayName}! 👋`);
      onClose();
    } catch (err) {
      if (err.code === "auth/user-not-found") setErr("lemail", "No account found with this email");
      else if (err.code === "auth/wrong-password" || err.code === "auth/invalid-credential")
        setErr("lpass", "Incorrect password ❌");
      else setErr("lemail", "Login failed. Try again.");
      toast.error("Login failed!");
    } finally {
      setLoading(false);
    }
  };

  // -- SIGNUP --------
  const handleSignup = async () => {
    const name     = signupNameRef.current?.value?.trim() || "";
    const phone    = signupPhoneRef.current?.value?.trim() || "";
    const email    = signupEmailRef.current?.value?.trim() || "";
    const password = signupPassRef.current?.value || "";
    let valid = true;

    if (!name)                       { setErr("sname",  "Name required"); valid = false; } else clearErr("sname");
    if (!/^\d{10}$/.test(phone))     { setErr("sphone", "Valid 10-digit number"); valid = false; } else clearErr("sphone");
    if (!email.includes("@"))        { setErr("semail", "Valid email required"); valid = false; } else clearErr("semail");
    if (password.length < 6)         { setErr("spass",  "Min 6 characters"); valid = false; } else clearErr("spass");
    if (!valid) return;

    setLoading(true);
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(result.user, { displayName: name });
      dispatch(setUser({ uid: result.user.uid, name, email, phone }));
      toast.success(`Welcome, ${name}! 🎉`);
      onClose();
    } catch (err) {
      console.error("Signup error:", err.code, err.message);
      if (err.code === "auth/email-already-in-use") setErr("semail", "Account already exists with this email");
      else if (err.code === "auth/weak-password") setErr("spass", "Password too weak");
      else if (err.code === "auth/invalid-email") setErr("semail", "Invalid email format");
      else setErr("semail", `Signup failed: ${err.message}`);
      toast.error("Signup failed!");
    } finally {
      setLoading(false);
    }
  };

  // -- FORGOT PASSWORD — only email sends reset link ----------
  const handleForgot = async () => {
    const email = forgotEmailRef.current?.value?.trim() || "";
    if (!email.includes("@")) { setErr("femail", "Enter valid email"); return; }
    clearErr("femail");
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      toast.success("Password reset email sent! 📧");
    } catch (err) {
      if (err.code === "auth/user-not-found") setErr("femail", "No account with this email");
      else setErr("femail", "Failed to send. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const EyeBtn = () => (
    <button type="button" onMouseDown={(e) => e.preventDefault()}
      onClick={() => setShowPass(!showPass)} className="text-gray-400 hover:text-orange-500 flex-shrink-0">
      {showPass ? <AiOutlineEyeInvisible size={18} /> : <AiOutlineEye size={18} />}
    </button>
  );

  const Field = ({ inputRef, icon: Icon, type, placeholder, errorKey, rightIcon }) => (
    <div>
      <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 focus-within:border-orange-400 transition ${
        errors[errorKey] ? "border-red-400" : "border-gray-200 dark:border-gray-700"
      }`}>
        <Icon className="text-gray-400 flex-shrink-0" size={18} />
        <input ref={inputRef} type={type || "text"} placeholder={placeholder}
          className="bg-transparent outline-none flex-1 text-gray-700 dark:text-white text-sm" />
        {rightIcon}
      </div>
      {errors[errorKey] && <p className="text-red-500 text-xs mt-1 ml-1">⚠️ {errors[errorKey]}</p>}
    </div>
  );

  const Btn = ({ onClick, label }) => (
    <button onClick={onClick} disabled={loading}
      className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-3 rounded-xl transition shadow-lg flex items-center justify-center gap-2">
      {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-7 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500">
          <AiOutlineClose size={22} />
        </button>

        {/* FORGOT — only email field, no password field */}
        {tab === "forgot" && (
          <div className="space-y-5">
            <button onClick={() => { setTab("login"); setErrors({}); setResetSent(false); }}
              className="text-sm text-orange-500 hover:underline">← Back to Login</button>

            {!resetSent ? (
              <>
                <div className="text-center">
                  <p className="text-3xl mb-1">🔒</p>
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white">Forgot Password</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Enter your email and we'll send you a reset link
                  </p>
                </div>
                <Field inputRef={forgotEmailRef} icon={AiOutlineMail} type="email"
                  placeholder="Registered email" errorKey="femail" />
                <Btn onClick={handleForgot} label="Send Reset Link 📧" />
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-4xl mb-3">✅</p>
                <h3 className="font-bold text-gray-800 dark:text-white mb-2">Check Your Email</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  We've sent a password reset link to your email. Click the link to set a new password.
                </p>
                <button onClick={() => { setTab("login"); setResetSent(false); }}
                  className="mt-4 text-orange-500 hover:underline text-sm font-medium">
                  Back to Login
                </button>
              </div>
            )}
          </div>
        )}

        {/* LOGIN / SIGNUP */}
        {tab !== "forgot" && (
          <>
            <div className="text-center mb-5">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                {tab === "login" ? "Welcome Back 👋" : "Create Account 🍕"}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
                {tab === "login" ? "Login to order your favourite food" : "Sign up to get started"}
              </p>
            </div>

            <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1 mb-5">
              {["login", "signup"].map((t) => (
                <button key={t} onClick={() => { setTab(t); setErrors({}); }}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition ${
                    tab === t ? "bg-orange-500 text-white shadow" : "text-gray-500 dark:text-gray-400"
                  }`}>
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>

            {tab === "login" && (
              <div className="space-y-3">
                <Field inputRef={loginEmailRef} icon={AiOutlineMail} type="email"
                  placeholder="Email Address" errorKey="lemail" />
                <Field inputRef={loginPassRef} icon={AiOutlineLock}
                  type={showPass ? "text" : "password"} placeholder="Password"
                  errorKey="lpass" rightIcon={<EyeBtn />} />
                <div className="text-right">
                  <button onClick={() => { setTab("forgot"); setErrors({}); }}
                    className="text-sm text-orange-500 hover:underline font-medium">
                    Forgot Password?
                  </button>
                </div>
                <Btn onClick={handleLogin} label="Login" />
              </div>
            )}

            {tab === "signup" && (
              <div className="space-y-3">
                <Field inputRef={signupNameRef} icon={AiOutlineUser}
                  placeholder="Full Name" errorKey="sname" />
                <div>
                  <div className={`flex items-center gap-3 border rounded-xl px-4 py-3 bg-gray-50 dark:bg-gray-800 focus-within:border-orange-400 transition ${
                    errors.sphone ? "border-red-400" : "border-gray-200 dark:border-gray-700"
                  }`}>
                    <AiOutlinePhone className="text-gray-400" size={18} />
                    <span className="text-gray-400 text-sm font-medium">+91</span>
                    <input ref={signupPhoneRef} type="tel" maxLength={10} placeholder="9876543210"
                      className="bg-transparent outline-none flex-1 text-gray-700 dark:text-white text-sm" />
                  </div>
                  {errors.sphone && <p className="text-red-500 text-xs mt-1 ml-1">⚠️ {errors.sphone}</p>}
                </div>
                <Field inputRef={signupEmailRef} icon={AiOutlineMail} type="email"
                  placeholder="Email Address" errorKey="semail" />
                <Field inputRef={signupPassRef} icon={AiOutlineLock}
                  type={showPass ? "text" : "password"} placeholder="Password (min 6 chars)"
                  errorKey="spass" rightIcon={<EyeBtn />} />
                <Btn onClick={handleSignup} label="Create Account 🎉" />
              </div>
            )}

            <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-4">
              {tab === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
              <button onClick={() => { setTab(tab === "login" ? "signup" : "login"); setErrors({}); }}
                className="text-orange-500 font-semibold hover:underline">
                {tab === "login" ? "Sign Up" : "Login"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;



