"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { PRODUCTS, TEXAS_CITIES, STORE_PICKUP_LOCATIONS } from "@/data/mockData";

const ShopContext = createContext(null);

export function ShopProvider({ children }) {
  // Current user: null = Guest, or object = Registered customer
  const [currentUser, setCurrentUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    setAuthReady(true);
  }, []);

  // Selected Texas City (defaults to Austin, TX)
  const [selectedCity, setSelectedCity] = useState(TEXAS_CITIES[2]);

  // Cart items
  const [cartItems, setCartItems] = useState([
    {
      product: PRODUCTS[0],
      variant: PRODUCTS[0].variants[0],
      quantity: 1,
    },
    {
      product: PRODUCTS[1],
      variant: PRODUCTS[1].variants[0],
      quantity: 1,
    },
  ]);

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

  // Cart operations
  const addToCart = (product, variant, qty = 1) => {
    setCartItems((prev) => {
      const idx = prev.findIndex(
        (item) => item.product.id === product.id && item.variant.id === variant.id
      );
      if (idx > -1) {
        const copy = [...prev];
        copy[idx].quantity += qty;
        return copy;
      }
      return [...prev, { product, variant, quantity: qty }];
    });
  };

  const updateQuantity = (productId, variantId, qty) => {
    if (qty <= 0) {
      removeFromCart(productId, variantId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.product.id === productId && item.variant.id === variantId
          ? { ...item, quantity: qty }
          : item
      )
    );
  };

  const removeFromCart = (productId, variantId) => {
    setCartItems((prev) =>
      prev.filter(
        (item) => !(item.product.id === productId && item.variant.id === variantId)
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const updateCheckoutData = (fields) => {
    setCheckoutData((prev) => ({ ...prev, ...fields }));
  };

  const loginUser = (user) => {
    setCurrentUser(user);
  };

  const logoutUser = () => {
    setCurrentUser(null);
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
        selectedCity,
        setSelectedCity,
        cartItems,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
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
