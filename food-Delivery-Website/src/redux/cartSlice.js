import { createSlice } from "@reduxjs/toolkit";
import { toast } from "react-toastify";

const cartSlice = createSlice({
  name: "cart",
  initialState: {
    items: [],
    totalQuantity: 0,
    totalAmount: 0,
  },
  reducers: {
    addToCart(state, action) {
      const newItem = action.payload;
      const existingItem = state.items.find((item) => item.id === newItem.id);

      if (!existingItem) {
        state.items.push({ ...newItem, quantity: 1, totalPrice: newItem.price });
        toast.success(`${newItem.name} added to cart! 🛒`);
      } else {
        existingItem.quantity++;
        existingItem.totalPrice += newItem.price;
        toast.info(`${newItem.name} quantity updated!`);
      }

      state.totalQuantity++;
      state.totalAmount += newItem.price;
    },

    removeFromCart(state, action) {
      const id = action.payload;
      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        state.totalQuantity -= existingItem.quantity;
        state.totalAmount -= existingItem.totalPrice;
        state.items = state.items.filter((item) => item.id !== id);
        toast.error(`Item removed from cart`);
      }
    },

    increaseQuantity(state, action) {
      const id = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        item.quantity++;
        item.totalPrice += item.price;
        state.totalQuantity++;
        state.totalAmount += item.price;
      }
    },

    decreaseQuantity(state, action) {
      const id = action.payload;
      const item = state.items.find((item) => item.id === id);
      if (item) {
        if (item.quantity === 1) {
          state.items = state.items.filter((i) => i.id !== id);
          toast.error(`Item removed from cart`);
        } else {
          item.quantity--;
          item.totalPrice -= item.price;
        }
        state.totalQuantity--;
        state.totalAmount -= item.price;
      }
    },

    clearCart(state) {
      state.items = [];
      state.totalQuantity = 0;
      state.totalAmount = 0;
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  increaseQuantity,
  decreaseQuantity,
  clearCart,
} = cartSlice.actions;

export default cartSlice.reducer;
