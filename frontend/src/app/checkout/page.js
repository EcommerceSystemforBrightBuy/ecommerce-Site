"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import {
  TEXAS_CITIES,
  STORE_PICKUP_LOCATIONS,
  calculateDeliveryEstimate,
} from "@/data/mockData";
import {
  Truck,
  Store,
  MapPin,
  Clock,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";

export default function CheckoutAddressPage() {
  const router = useRouter();
  const {
    cartItems,
    buyNowItem,
    currentUser,
    checkoutData,
    updateCheckoutData,
    cartSubtotal,
  } = useShop();

  const checkoutItems = buyNowItem ? [buyNowItem] : cartItems;
  const singleStore = STORE_PICKUP_LOCATIONS[0];

  const allItemsInStock = checkoutItems.length > 0 && checkoutItems.every((item) => {
    const stock = Number(item.variant?.stock ?? item.stock ?? 0);
    const qty = Number(item.quantity || 1);
    return stock >= qty;
  });

  const estimate = calculateDeliveryEstimate(
    checkoutData.shippingCity,
    allItemsInStock
  );

  const handleContinue = (e) => {
    e.preventDefault();
    if (!currentUser) {
      router.push("/login?redirect=/checkout");
      return;
    }
    router.push("/checkout/payment");
  };

  if (checkoutItems.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#222222]">No items to checkout</h2>
        <p className="text-xs text-[#717171]">Your cart is empty.</p>
        <Link
          href="/products"
          className="bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold px-6 py-3 rounded-full inline-block"
        >
          Browse Products
        </Link>
      </main>
    );
  }

  const [useDifferentAddress, setUseDifferentAddress] = useState(false);

  const handleToggleDifferentAddress = (checked) => {
    setUseDifferentAddress(checked);
    if (checked) {
      updateCheckoutData({
        streetAddress: "",
        zipCode: "",
        phoneNumber: currentUser?.phone || "",
      });
    } else if (currentUser) {
      updateCheckoutData({
        shippingCity: currentUser.city || "Austin",
        streetAddress: currentUser.addressLine || "4500 Tech Ridge Blvd, Suite 200",
        zipCode: currentUser.postalCode || "78753",
        phoneNumber: currentUser.phone || "(512) 555-0188",
      });
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Breadcrumb Steps */}
      <div className="flex items-center gap-2 text-xs text-[#717171] border-b border-[#EBEBEB] pb-4">
        <Link href="/cart" className="hover:underline">
          1. Cart
        </Link>
        <span>&gt;</span>
        <span className="font-bold text-[#222222]">2. Delivery &amp; Address</span>
        <span>&gt;</span>
        <span>3. Payment &amp; Review</span>
        <span>&gt;</span>
        <span>4. Confirmation</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[#EBEBEB] pb-4">
        <div>
          <h1 className="text-2xl font-black text-[#222222]">
            Fulfillment Mode &amp; Address
          </h1>
          <p className="text-xs text-[#717171] mt-0.5">
            Texas ground courier delivery or Store Pickup at BrightBuy Central Texas Hub.
          </p>
        </div>
        {currentUser && (
          <div className="text-xs font-bold text-[#222222] bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#DDDDDD]">
            Customer: {currentUser.name}
          </div>
        )}
      </div>

      <form onSubmit={handleContinue} className="space-y-8">
        {/* Step 1: Fulfillment Mode Toggle */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#222222] uppercase tracking-wider block">
            Select Fulfillment Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Standard Delivery */}
            <div
              onClick={() => updateCheckoutData({ deliveryMode: "standard" })}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 bg-white ${checkoutData.deliveryMode === "standard"
                  ? "border-[#222222] ring-1 ring-[#222222] shadow-sm"
                  : "border-[#DDDDDD] hover:border-[#222222]"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
                  <Truck className="w-4 h-4 text-[#FF385C]" />
                  <span>Standard Texas Delivery</span>
                </div>
                <span className="font-bold text-[#222222]">
                  {cartSubtotal > 150 ? "FREE" : "$15.00"}
                </span>
              </div>
              <p className="text-[#717171] text-xs leading-relaxed">
                Dispatched from Central Warehouse in Austin. Main cities delivered in 5 business days,
                regional Texas in 7 days.
              </p>
            </div>

            {/* Store Pickup */}
            <div
              onClick={() => updateCheckoutData({ deliveryMode: "pickup" })}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 bg-white ${checkoutData.deliveryMode === "pickup"
                  ? "border-[#222222] ring-1 ring-[#222222] shadow-sm"
                  : "border-[#DDDDDD] hover:border-[#222222]"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
                  <Store className="w-4 h-4 text-[#FF385C]" />
                  <span>Central Store Pickup</span>
                </div>
                <span className="font-bold text-emerald-700">FREE</span>
              </div>
              <p className="text-[#717171] text-xs leading-relaxed">
                Collect in 24 hours at our Central Store counter in Austin, TX (4500 Tech Ridge Blvd).
              </p>
            </div>
          </div>
        </div>

        {/* Step 2: Address Input with Custom Address Checkbox */}
        {checkoutData.deliveryMode === "standard" ? (
          <div className="border border-[#DDDDDD] rounded-2xl p-6 space-y-4 text-xs bg-white">
            <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
              <div className="font-bold text-[#222222] text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#FF385C]" />
                <span>Texas Delivery Address</span>
              </div>

              {/* Checkbox to use custom alternate address */}
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#FF385C] bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#DDDDDD]">
                <input
                  type="checkbox"
                  checked={useDifferentAddress}
                  onChange={(e) => handleToggleDifferentAddress(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-[#FF385C] focus:ring-0"
                />
                <span>Use a different shipping address</span>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#222222] font-bold mb-1 text-xs">
                  Texas Destination City
                </label>
                <select
                  value={checkoutData.shippingCity}
                  onChange={(e) => updateCheckoutData({ shippingCity: e.target.value })}
                  className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs font-bold text-[#222222]"
                >
                  {TEXAS_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, TX {c.isMain ? "(5-Day Main City)" : "(7-Day Regional)"}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[#222222] font-bold mb-1 text-xs">
                  Contact Phone
                </label>
                <input
                  type="text"
                  required
                  value={checkoutData.phoneNumber}
                  onChange={(e) => updateCheckoutData({ phoneNumber: e.target.value })}
                  placeholder="(512) 555-0100"
                  className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[#222222] font-bold mb-1 text-xs">
                  Street Address {useDifferentAddress ? "(New Address)" : ""}
                </label>
                <input
                  type="text"
                  required
                  value={checkoutData.streetAddress}
                  onChange={(e) => updateCheckoutData({ streetAddress: e.target.value })}
                  placeholder="e.g. 100 Congress Ave, Suite 500"
                  className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
                />
              </div>

              <div>
                <label className="block text-[#222222] font-bold mb-1 text-xs">
                  Postal ZIP Code
                </label>
                <input
                  type="text"
                  required
                  value={checkoutData.zipCode}
                  onChange={(e) => updateCheckoutData({ zipCode: e.target.value })}
                  placeholder="78701"
                  className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs font-mono text-[#222222]"
                />
              </div>

              <div>
                <label className="block text-[#222222] font-bold mb-1 text-xs">
                  State
                </label>
                <input
                  type="text"
                  disabled
                  value="Texas (TX)"
                  className="w-full bg-[#EBEBEB] border border-[#DDDDDD] rounded-xl p-3 text-xs font-bold text-[#717171] cursor-not-allowed"
                />
              </div>
            </div>

            {/* Delivery Estimate Box based on stock availability and city */}
            <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] space-y-1.5 mt-4">
              <div className="flex items-center justify-between font-bold text-[#222222]">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#FF385C]" />
                  <span>Estimated Delivery Arrival:</span>
                </div>
                <span className="text-[#FF385C] font-black text-sm">{estimate.days} Days ({estimate.estimatedDate})</span>
              </div>
              <p className="text-[#717171] text-[11px] leading-relaxed">
                • {estimate.isMain ? "Main Metro City (5 days base)" : "Regional Texas City (7 days base)"}
                {estimate.stockDelayAdded && " + 3 days out-of-stock buffer"}
              </p>
            </div>
          </div>
        ) : (
          <div className="border border-[#DDDDDD] rounded-2xl p-6 space-y-4 text-xs bg-white">
            <div className="font-bold text-[#222222] text-sm flex items-center gap-2">
              <Store className="w-4 h-4 text-[#FF385C]" />
              <span>Store Pickup Location (Ready in 24 Hours)</span>
            </div>

            <div className="p-5 rounded-2xl border border-[#222222] bg-[#F7F7F7] flex items-center gap-4">
              <img
                src={singleStore.image}
                alt={singleStore.name}
                className="w-20 h-20 rounded-2xl object-cover border border-[#DDDDDD] shrink-0"
              />
              <div className="space-y-1">
                <div className="font-black text-sm text-[#222222]">{singleStore.name}</div>
                <div className="text-xs text-[#717171]">{singleStore.address}</div>
                <div className="text-xs font-bold text-emerald-700 pt-0.5">
                  Hours: {singleStore.hours} • Phone: {singleStore.phone}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
          <Link
            href="/cart"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#222222] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>

          <button
            type="submit"
            className="py-3.5 px-6 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-md"
          >
            <span>Continue to Payment &amp; Review</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </main>
  );
}
