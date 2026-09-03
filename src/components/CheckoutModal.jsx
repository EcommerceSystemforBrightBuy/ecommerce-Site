"use client";

import React, { useState } from "react";
import {
  X,
  Truck,
  Store,
  CreditCard,
  Banknote,
  CheckCircle2,
  Calendar,
  Warehouse,
  ShieldCheck,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  MapPin,
  Clock,
  Printer,
  ChevronRight,
} from "lucide-react";
import {
  TEXAS_CITIES,
  STORE_PICKUP_LOCATIONS,
  calculateDeliveryEstimate,
} from "@/data/mockData";

export default function CheckoutModal({
  isOpen,
  onClose,
  cartItems,
  currentUser,
  selectedCity,
  onOrderCompleted,
}) {
  // Checkout State
  const [deliveryMode, setDeliveryMode] = useState("standard"); // 'standard' | 'pickup'
  const [paymentMethod, setPaymentMethod] = useState("card"); // 'card' | 'cod'
  const [shippingCity, setShippingCity] = useState(selectedCity.name);
  const [pickupStoreId, setPickupStoreId] = useState(STORE_PICKUP_LOCATIONS[0].id);

  // Form Fields
  const [streetAddress, setStreetAddress] = useState("4500 Tech Ridge Blvd, Suite 200");
  const [zipCode, setZipCode] = useState("78753");
  const [phoneNumber, setPhoneNumber] = useState("(512) 555-0188");
  const [cardNumber, setCardNumber] = useState("•••• •••• •••• 4242");
  const [cardExpiry, setCardExpiry] = useState("08/28");
  const [cardCvc, setCardCvc] = useState("892");

  // Step state: 'form' | 'success'
  const [step, setStep] = useState("form");
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState(null);

  if (!isOpen) return null;

  // Stock check
  const hasOutOfStockItem = cartItems.some((i) => i.variant.stock <= 0);
  const deliveryEstimate = calculateDeliveryEstimate(
    shippingCity,
    !hasOutOfStockItem
  );

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );
  const tax = subtotal * 0.0825; // Texas sales tax 8.25%
  const shippingFee = deliveryMode === "pickup" ? 0.0 : subtotal > 150 ? 0.0 : 15.0;
  const orderTotal = subtotal + tax + shippingFee;

  const selectedStore =
    STORE_PICKUP_LOCATIONS.find((s) => s.id === pickupStoreId) ||
    STORE_PICKUP_LOCATIONS[0];

  const handlePlaceOrder = (e) => {
    e.preventDefault();
    setIsProcessing(true);

    // Simulate atomic inventory deduction & order generation
    setTimeout(() => {
      const orderId = `BB-TX-${new Date().getFullYear()}-${Math.floor(
        100000 + Math.random() * 900000
      )}`;

      const orderData = {
        orderId,
        date: new Date().toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        customer: currentUser,
        items: [...cartItems],
        subtotal,
        tax,
        shippingFee,
        orderTotal,
        deliveryMode,
        paymentMethod,
        shippingCity,
        streetAddress,
        pickupStore: selectedStore,
        estimatedDate:
          deliveryMode === "pickup" ? "Ready in 24 Hours" : deliveryEstimate.estimatedDate,
        days: deliveryEstimate.days,
        hasOutOfStockItem,
      };

      setCompletedOrder(orderData);
      setIsProcessing(false);
      setStep("success");
      if (onOrderCompleted) {
        onOrderCompleted(orderData);
      }
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
              TX
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                {step === "form" ? "BrightBuy Texas Checkout" : "Order Confirmation"}
              </h3>
              <p className="text-[11px] text-slate-500 leading-tight">
                {step === "form"
                  ? "Central Warehouse Atomic Inventory Verification"
                  : "Thank you for shopping local with BrightBuy"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: CHECKOUT FORM */}
        {step === "form" && (
          <form onSubmit={handlePlaceOrder} className="p-6 overflow-y-auto space-y-6">
            {/* Customer Verification Badge */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Authenticated Customer: <strong>{currentUser?.name || "Registered Shopper"}</strong> (
                  {currentUser?.email || "customer@brightbuy.tx"})
                </span>
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-200/80 px-2 py-0.5 rounded text-emerald-800">
                Verified Account
              </span>
            </div>

            {/* SECTION: DELIVERY MODE SELECTION */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                1. Select Texas Delivery Mode
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Mode: Standard Delivery */}
                <div
                  onClick={() => setDeliveryMode("standard")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryMode === "standard"
                      ? "border-blue-600 bg-blue-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <Truck className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900">Standard Delivery</span>
                    </div>
                    <span className="text-xs font-bold text-slate-800">
                      {shippingFee === 0 ? "FREE" : "$15.00"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    Direct Texas statewide delivery from Central Warehouse. Main cities: 5 days,
                    Regional: 7 days.
                  </p>
                </div>

                {/* Mode: Store Pickup */}
                <div
                  onClick={() => setDeliveryMode("pickup")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    deliveryMode === "pickup"
                      ? "border-blue-600 bg-blue-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                        <Store className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900">Store Pickup</span>
                    </div>
                    <span className="text-xs font-bold text-emerald-700">FREE</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-snug">
                    Collect in 24 hours at any of our 5 Texas retail branches (Austin, Dallas,
                    Houston, San Antonio, Fort Worth).
                  </p>
                </div>
              </div>
            </div>

            {/* CONDITIONAL DELIVERY DETAILS */}
            {deliveryMode === "standard" ? (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    <span>Texas Destination City</span>
                  </div>
                  <select
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    className="w-full sm:w-auto text-xs font-bold bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 shadow-2xs"
                  >
                    {TEXAS_CITIES.map((city) => (
                      <option key={city.name} value={city.name}>
                        {city.name}, TX {city.isMain ? "(Main City - 5 Days)" : "(Regional - 7 Days)"}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      required
                      className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        ZIP Code
                      </label>
                      <input
                        type="text"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        required
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        value="Texas (TX)"
                        disabled
                        className="w-full text-xs bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-slate-600 font-semibold"
                      />
                    </div>
                  </div>
                </div>

                {/* Real-time calculated estimate breakdown banner */}
                <div className="p-3 bg-white rounded-xl border border-blue-200 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="font-semibold text-slate-900">
                        {deliveryEstimate.isMain ? "Main Metro City Tier" : "Regional City Tier"}:
                      </span>{" "}
                      <span className="text-slate-600">
                        {deliveryEstimate.baseDays} days transit
                        {deliveryEstimate.stockDelayAdded && " + 3 days out-of-stock restocking"}
                      </span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[11px] text-slate-400">Guaranteed ETA</div>
                    <div className="font-bold text-blue-600">
                      {deliveryEstimate.estimatedDate} ({deliveryEstimate.days}d)
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Choose Texas Store Location (Ready in 24 Hours)</span>
                </div>
                <div className="grid grid-cols-1 gap-2">
                  {STORE_PICKUP_LOCATIONS.map((loc) => {
                    const isSelected = loc.id === pickupStoreId;
                    return (
                      <div
                        key={loc.id}
                        onClick={() => setPickupStoreId(loc.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-emerald-50/70 border-emerald-600 ring-1 ring-emerald-600"
                            : "bg-white border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{loc.name}</div>
                          <div className="text-[11px] text-slate-500">{loc.address}</div>
                        </div>
                        <div className="text-right text-[11px] text-slate-500">
                          <span className="font-semibold text-emerald-700 block">Open Daily</span>
                          <span>{loc.hours}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* SECTION: PAYMENT METHOD SELECTION */}
            <div>
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block mb-3">
                2. Select Payment Method
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option: Card Payment */}
                <div
                  onClick={() => setPaymentMethod("card")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "card"
                      ? "border-blue-600 bg-blue-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                        <CreditCard className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900">Card Payment</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pay securely with Visa, Mastercard, or American Express.
                  </p>
                </div>

                {/* Option: Cash on Delivery */}
                <div
                  onClick={() => setPaymentMethod("cod")}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    paymentMethod === "cod"
                      ? "border-blue-600 bg-blue-50/40 shadow-xs"
                      : "border-slate-200 hover:border-slate-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-amber-100 text-amber-700">
                        <Banknote className="w-4 h-4" />
                      </div>
                      <span className="font-bold text-sm text-slate-900">Cash on Delivery</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Pay in cash upon doorstep delivery or at retail store pickup counter.
                  </p>
                </div>
              </div>

              {paymentMethod === "card" && (
                <div className="mt-3 p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="sm:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Card Number
                      </label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2.5 font-mono text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SECTION: ORDER SUMMARY & INVENTORY VERIFICATION */}
            <div className="p-4 bg-slate-100/70 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800">Items in Order</span>
                <span className="text-slate-500">{cartItems.length} item(s) mapped to SKU</span>
              </div>

              <div className="divide-y divide-slate-200 max-h-40 overflow-y-auto pr-1">
                {cartItems.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variant.id}`}
                    className="py-2 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{item.product.name}</span>
                      <span className="text-slate-500 ml-1">({item.variant.name})</span>
                      <div className="text-[10px] font-mono text-slate-500">
                        SKU: {item.variant.sku} × {item.quantity}
                      </div>
                    </div>
                    <span className="font-mono font-semibold text-slate-900">
                      ${(item.variant.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Texas Sales Tax (8.25%)</span>
                  <span>${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Delivery ({deliveryMode === "pickup" ? "Store Pickup" : "Standard"})</span>
                  <span>{shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}</span>
                </div>
                <div className="pt-2 border-t border-slate-300 flex justify-between text-base font-black text-slate-900">
                  <span>Total Due</span>
                  <span className="text-blue-600">${orderTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Atomic Stock Reservation Note */}
              <div className="p-2.5 bg-blue-50/90 rounded-xl border border-blue-200/80 flex items-center gap-2 text-[11px] text-blue-900">
                <Warehouse className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>Atomic Transaction:</strong> Central warehouse inventory is verified and
                  decremented synchronously upon order placement.
                </span>
              </div>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-[0.99] text-white font-bold text-sm shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Validating Warehouse Inventory &amp; Placing Order...</span>
              ) : (
                <>
                  <span>Place Order • ${orderTotal.toFixed(2)}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: ORDER SUCCESS CONFIRMATION */}
        {step === "success" && completedOrder && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900">Order Placed Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your order has been logged into BrightBuy's system and central warehouse stock has
                been atomically reserved.
              </p>
              <div className="inline-block mt-2 px-3 py-1 bg-slate-100 rounded-full font-mono text-xs font-bold text-slate-800 border border-slate-200">
                Order ID: {completedOrder.orderId}
              </div>
            </div>

            {/* Delivery/Pickup Status Card */}
            <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl space-y-3">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 font-bold text-blue-900">
                  {completedOrder.deliveryMode === "pickup" ? (
                    <Store className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Truck className="w-4 h-4 text-blue-600" />
                  )}
                  <span>
                    {completedOrder.deliveryMode === "pickup"
                      ? "Store Pickup Summary"
                      : "Standard Delivery Transit"}
                  </span>
                </div>
                <span className="text-[11px] font-bold bg-blue-200/80 text-blue-900 px-2 py-0.5 rounded">
                  Status: Processing Dispatch
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block">
                    {completedOrder.deliveryMode === "pickup" ? "Pickup Branch:" : "Deliver To:"}
                  </span>
                  <span className="font-bold text-slate-900 block">
                    {completedOrder.deliveryMode === "pickup"
                      ? completedOrder.pickupStore.name
                      : `${completedOrder.shippingCity}, TX`}
                  </span>
                  <span className="text-slate-600 text-[11px]">
                    {completedOrder.deliveryMode === "pickup"
                      ? completedOrder.pickupStore.address
                      : `${completedOrder.streetAddress}, ${completedOrder.shippingCity}`}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Estimated Timeline:</span>
                  <span className="font-bold text-blue-700 text-sm block">
                    {completedOrder.estimatedDate}
                  </span>
                  <span className="text-slate-500 text-[11px]">
                    {completedOrder.deliveryMode === "pickup"
                      ? "Ready within 24 business hours"
                      : `${completedOrder.days} business days dispatch from Central Warehouse`}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment & Items Breakdown */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                <span className="text-slate-500">Payment Method:</span>
                <span className="font-bold text-slate-900 flex items-center gap-1.5">
                  {completedOrder.paymentMethod === "card" ? (
                    <>
                      <CreditCard className="w-3.5 h-3.5 text-blue-600" /> Card Payment (Paid Online)
                    </>
                  ) : (
                    <>
                      <Banknote className="w-3.5 h-3.5 text-amber-600" /> Cash on Delivery (Pay at
                      Arrival)
                    </>
                  )}
                </span>
              </div>

              <div className="space-y-1.5 py-1">
                {completedOrder.items.map((item) => (
                  <div
                    key={`${item.product.id}-${item.variant.id}`}
                    className="flex justify-between items-center text-xs"
                  >
                    <div>
                      <span className="font-semibold text-slate-800">{item.product.name}</span>{" "}
                      <span className="text-slate-500 text-[11px]">
                        ({item.variant.name}) × {item.quantity}
                      </span>
                      <div className="text-[10px] font-mono text-slate-400">
                        SKU: {item.variant.sku}
                      </div>
                    </div>
                    <span className="font-mono font-medium text-slate-900">
                      ${(item.variant.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-sm text-slate-900">
                <span>Total Charged:</span>
                <span className="text-blue-600">${completedOrder.orderTotal.toFixed(2)}</span>
              </div>
            </div>

            {/* Finished Actions */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all text-center shadow-xs"
              >
                Back to Storefront
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
