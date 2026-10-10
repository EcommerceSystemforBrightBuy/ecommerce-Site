"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { TEXAS_CITIES, STORE_PICKUP_LOCATIONS } from "@/data/mockData";

const ShopContext = createContext(null);

// Same base URL the other pages use (frontend/.env.local -> NEXT_PUBLIC_URL=http://localhost:8000)
const API = process.env.NEXT_PUBLIC_URL;

const USER_KEY = "brightbuy_user"; // the logged-in customer (so a page refresh doesn't log you out)
const GUEST_CART_KEY = "brightbuy_guest_cart"; // a guest's cart (guests have no database cart)
const MAX_QTY = 99;

// localStorage can throw (private mode, blocked storage), so always go through these helpers.
const readStorage = (key) => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const writeStorage = (key, value) => {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage unavailable: the app still works, it just won't remember */
  }
};

// Small wrapper around fetch for the backend API. Throws an Error with the server's message.
async function api(path, options = {}) {
  const res = await fetch(`${API}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data;
}

// The product page hands us the API shape (product_id, variant_name, image_url...).
// The cart, checkout and payment pages use one simple shape, so convert once, here.
const toCartItem = (product, variant, quantity) => ({
  product: {
    id: product.product_id ?? product.id,
    name: product.name ?? product.product_name,
    image: product.image_url ?? product.image,
  },
  variant: {
    id: variant.variant_id ?? variant.id,
    name: variant.variant_name ?? variant.name,
    sku: variant.sku,
    price: Number(variant.price),
    stock: variant.stock ?? 0,
  },
  quantity,
});

export function ShopProvider({ children }) {
  // Current user: null = Guest, or object = Registered customer (returned by /api/auth/login)
  const [currentUser, setCurrentUser] = useState(null);
  // false until we have looked in localStorage, so pages don't flash the wrong state
  const [authReady, setAuthReady] = useState(false);

  // Selected Texas City
  const [selectedCity, setSelectedCity] = useState(TEXAS_CITIES[2]);

  // Cart items: [{ product: {id,name,image}, variant: {id,name,sku,price,stock}, quantity }]
  const [cartItems, setCartItems] = useState([]);

  // Checkout address & delivery info
  const [checkoutData, setCheckoutData] = useState({
    deliveryMode: "standard", // 'standard' | 'pickup'
    shippingCity: "Austin",
    streetAddress: "4500 Tech Ridge Blvd, Suite 200",
    zipCode: "78753",
    phoneNumber: "(512) 555-0188",
    pickupStoreId: STORE_PICKUP_LOCATIONS[0].id,
    paymentMethod: "card", // 'card' | 'cod'
    cardNumber: "•••• •••• •••• 4242",
    cardExpiry: "08/28",
    cardCvc: "892",
  });

  // Last completed order
  const [lastOrder, setLastOrder] = useState(null);

  // Use the customer's saved profile to pre-fill the destination city and checkout address
  const applyProfile = (user) => {
    const city = TEXAS_CITIES.find((c) => c.name === user.city);
    if (city) setSelectedCity(city);
    setCheckoutData((prev) => ({
      ...prev,
      shippingCity: user.city || prev.shippingCity,
      streetAddress: user.addressLine || prev.streetAddress,
      zipCode: user.postalCode || prev.zipCode,
      phoneNumber: user.phone || prev.phoneNumber,
    }));
  };

  // Reload the saved cart from the database (used after a failed update to get back in sync)
  const refreshCart = async (user = currentUser) => {
    if (!user) return;
    try {
      const data = await api(`/cart/${user.customerId}`);
      setCartItems(data.items);
    } catch (err) {
      console.error("Could not load cart:", err);
    }
  };

  // On first load: restore the logged-in user (and their saved cart) or the guest cart.
  useEffect(() => {
    const savedUser = readStorage(USER_KEY);
    const guestCart = readStorage(GUEST_CART_KEY);

    // Deferred with a promise so the state updates happen after the effect itself has finished
    Promise.resolve().then(() => {
      if (savedUser?.customerId) {
        setCurrentUser(savedUser);
        applyProfile(savedUser);
        refreshCart(savedUser);
      } else if (Array.isArray(guestCart)) {
        setCartItems(guestCart);
      }
      setAuthReady(true);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Guests: keep the cart in localStorage. Logged-in customers: the database is the source of truth.
  useEffect(() => {
    if (authReady && !currentUser) writeStorage(GUEST_CART_KEY, cartItems);
  }, [cartItems, currentUser, authReady]);

  // ---- Cart operations -------------------------------------------------
  // Each one updates the screen immediately, then tells the server (only for logged-in customers).
  // If the server call fails, we reload the real cart from the database.

  const addToCart = (product, variant, qty = 1) => {
    const item = toCartItem(product, variant, qty);

    setCartItems((prev) => {
      const idx = prev.findIndex(
        (it) => it.product.id === item.product.id && it.variant.id === item.variant.id
      );
      if (idx > -1) {
        return prev.map((it, i) =>
          i === idx ? { ...it, quantity: Math.min(it.quantity + qty, MAX_QTY) } : it
        );
      }
      return [...prev, item];
    });

    if (currentUser) {
      api("/cart/items", {
        method: "POST",
        body: JSON.stringify({
          customerId: currentUser.customerId,
          variantId: item.variant.id,
          quantity: qty,
        }),
      }).catch(() => refreshCart());
    }
  };

  const updateQuantity = (productId, variantId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    const safeQty = Math.min(qty, MAX_QTY);

    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variant.id === variantId
          ? { ...item, quantity: safeQty }
          : item
      )
    );

    if (currentUser) {
      api("/cart/items", {
        method: "PUT",
        body: JSON.stringify({ customerId: currentUser.customerId, variantId, quantity: safeQty }),
      }).catch(() => refreshCart());
    }
  };

  const removeFromCart = (productId, variantId) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.variant.id === variantId)
      )
    );

    if (currentUser) {
      api(`/cart/${currentUser.customerId}/items/${variantId}`, { method: "DELETE" }).catch(() =>
        refreshCart()
      );
    }
  };

  // Called after a successful order (payment page) so the saved cart is emptied too
  const clearCart = () => {
    setCartItems([]);
    if (currentUser) {
      api(`/cart/${currentUser.customerId}`, { method: "DELETE" }).catch(() => refreshCart());
    }
  };

  const updateCheckoutData = (fields) => {
    setCheckoutData((prev) => ({ ...prev, ...fields }));
  };

  // ---- Auth ------------------------------------------------------------

  // Called by the login and register pages with the user object the API returned.
  // Merges anything the guest put in the cart into the customer's saved cart.
  const loginUser = async (user) => {
    setCurrentUser(user);
    writeStorage(USER_KEY, user);
    applyProfile(user);

    const guestItems = cartItems.map((item) => ({
      variantId: item.variant.id,
      quantity: item.quantity,
    }));

    try {
      const data =
        guestItems.length > 0
          ? await api("/cart/sync", {
              method: "POST",
              body: JSON.stringify({ customerId: user.customerId, items: guestItems }),
            })
          : await api(`/cart/${user.customerId}`);
      setCartItems(data.items);
      writeStorage(GUEST_CART_KEY, null);
    } catch (err) {
      console.error("Could not sync cart:", err);
      await refreshCart(user);
    }
  };

  // After the profile is edited, keep the stored user in step with the database
  const updateUser = (user) => {
    setCurrentUser(user);
    writeStorage(USER_KEY, user);
    applyProfile(user);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    writeStorage(USER_KEY, null);
    setCartItems([]); // the saved cart stays in the database for next login
  };

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const cartSubtotal = cartItems.reduce(
    (acc, item) => acc + item.variant.price * item.quantity,
    0
  );

  const texasSalesTax = cartSubtotal * 0.0825; // Texas 8.25% state sales tax

  return (
    <ShopContext.Provider
      value={{
        currentUser,
        authReady,
        loginUser,
        logoutUser,
        updateUser,
        selectedCity,
        setSelectedCity,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart,
        totalCartCount,
        cartSubtotal,
        texasSalesTax,
        checkoutData,
        updateCheckoutData,
        lastOrder,
        setLastOrder,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error("useShop must be used within a ShopProvider");
  }
  return context;
}
