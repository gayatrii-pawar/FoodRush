 FoodRush
 
A food delivery web application built with React and Firebase. Browse food items, manage a cart, checkout, and track orders — with a real authentication and database backend.
Live: food-rush-eta.vercel.app
---
Features
Auth
Login, signup, and password reset are handled through Firebase Authentication. Routes like checkout are protected and redirect unauthenticated users to log in first.
Browsing
Search and category filters narrow down the menu in real time. Each item has its own detail page (`/food/:id`) with ingredients, calories, and prep time, plus a review and rating system. Recently viewed items and a wishlist are tracked per user.
Cart & Checkout
Items can be added with quantity controls, and totals update live. Checkout includes form validation, a payment method selector, and a delivery countdown timer once the order is placed. Orders are written to Firestore.
Account
Users can edit their profile, view order history pulled from Firestore, and manage multiple saved addresses (add, edit, delete, set default).
Other
Dark mode, skeleton loading states, page transition animations, a back-to-top button, and a 404 page round out the UX.
---
Stack
React 18 · Redux Toolkit · Firebase (Auth + Firestore) · React Router v6 · Tailwind CSS · Vite
---
Running locally
```bash
git clone https://github.com/gayatrii-pawar/FoodRush.git
cd FoodRush
npm install
```
Create a `.env` file in the root with your own Firebase project config:
```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```
(Get these from Firebase Console → Project Settings → Your apps.)
```bash
npm run dev
```
---
Structure
```
src/
├── components/   # AuthModal, SearchFilter, DarkModeToggle, BackToTop...
├── pages/        # Cart, Checkout, OrderHistory, UserProfile, FoodDetail...
├── redux/        # store, cartSlice, authSlice
├── context/      # DarkModeContext
├── data/         # food data
└── firebase.js   # Firebase config
```
Scripts
Command	Description
`npm run dev`	Start dev server
`npm run build`	Production build
`npm run preview`	Preview the build
`npm run lint`	Run ESLint

