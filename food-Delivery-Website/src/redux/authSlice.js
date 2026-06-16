
import { createSlice } from "@reduxjs/toolkit";

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: JSON.parse(localStorage.getItem("user") || "null"),
    isLoggedIn: !!localStorage.getItem("user"),
    loading: false,
  },
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
      state.isLoggedIn = true;
      localStorage.setItem("user", JSON.stringify(action.payload));
    },
    clearUser(state) {
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem("user");
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },

    // Keep logout as alias for clearUser for backward compatibility
    logout(state) {
      state.user = null;
      state.isLoggedIn = false;
      localStorage.removeItem("user");
    },
  },
});

export const { setUser, clearUser, setLoading, logout } = authSlice.actions;
export default authSlice.reducer;

