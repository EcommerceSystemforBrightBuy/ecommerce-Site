"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import {
  STORE_PICKUP_LOCATIONS,
  calculateDeliveryEstimate,
} from "@/data/mockData";
import {
  CreditCard,
  Banknote,
  Warehouse,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
} from "lucide-react";

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const {
    cartItems,
    currentUser,
    checkoutData,
    updateCheckoutData,
    cartSubtotal,
    texasSalesTax,
    clearCart,
    setLastOrder,
  } = useShop();


  const handlePayNow = async (e) => {
    e.preventDefault();
    setProcessing(true);

    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:8000";
      const payload = {
        customerId: currentUser?.customer_id || currentUser?.id || 'CUST005',
        totalAmount: totalDue,
        deliveryMode: checkoutData.deliveryMode || "standard",
        shippingCity: checkoutData.shippingCity || "Houston",
        paymentMethod: checkoutData.paymentMethod === "card" ? "Card Payment" : "Cash on Delivery",
        items: cartItems.map((item) => ({
          variantId: item.variant?.variant_id || item.variant?.variantId || item.variant?.id || item.variant_id || "VAR001",
          quantity: item.quantity || 1,
          unitPrice: item.variant?.price !== undefined ? parseFloat(item.variant.price) : (item.unitPrice || 0)
        }))
      };
      const response = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.success) {
        clearCart();
        setProcessing(false);
        router.push("/checkout/confirmation");
      } else {
        alert("Checkout failed: " + (result.error || result.message));
        setProcessing(false);
      }
    } catch (err) {
      console.error("payment submission error", err);
      alert("Server error connecting to backend API");
      setProcessing(false);
    }
  };


  const [processing, setProcessing] = useState(false);

  const hasOutOfStock = cartItems.some((i) => i.variant.stock <= 0);
  const estimate = calculateDeliveryEstimate(
    checkoutData.shippingCity,
    !hasOutOfStock
  );

  const shippingFee =
    checkoutData.deliveryMode === "pickup"
      ? 0.0
      : cartSubtotal > 150
        ? 0.0
        : 15.0;

  const totalDue = cartSubtotal + texasSalesTax + shippingFee;

  const selectedStore =
    STORE_PICKUP_LOCATIONS.find((s) => s.id === checkoutData.pickupStoreId) ||
    STORE_PICKUP_LOCATIONS[0];

  // const handlePlaceOrder = (e) => {
  //   e.preventDefault();
  //   setProcessing(true);

  //   setTimeout(() => {
  //     const orderId = `BB-TX-${new Date().getFullYear()}-${Math.floor(
  //       100000 + Math.random() * 900000
  //     )}`;

  //     const orderRecord = {
  //       orderId,
  //       date: new Date().toLocaleDateString("en-US", {
  //         month: "short",
  //         day: "numeric",
  //         year: "numeric",
  //       }),
  //       customer: currentUser,
  //       items: [...cartItems],
  //       subtotal: cartSubtotal,
  //       tax: texasSalesTax,
  //       shippingFee,
  //       totalDue,
  //       deliveryMode: checkoutData.deliveryMode,
  //       paymentMethod: checkoutData.paymentMethod,
  //       shippingCity: checkoutData.shippingCity,
  //       streetAddress: checkoutData.streetAddress,
  //       pickupStore: selectedStore,
  //       estimatedArrival:
  //         checkoutData.deliveryMode === "pickup"
  //           ? "Ready within 24 hours"
  //           : estimate.estimatedDate,
  //       transitDays: estimate.days,
  //     };

  //     setLastOrder(orderRecord);
  //     clearCart();
  //     setProcessing(false);
  //     router.push("/checkout/confirmation");
  //   }, 1200);
  // };

  if (cartItems.length === 0) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-[#222222]">No active order in progress</h2>
        <Link
          href="/products"
          className="bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold px-6 py-3 rounded-full inline-block"
        >
          Return to Catalog
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Breadcrumb Steps */}
      <div className="flex items-center gap-2 text-xs text-[#717171] border-b border-[#EBEBEB] pb-4">
        <Link href="/cart" className="hover:underline">
          1. Cart
        </Link>
        <span>&gt;</span>
        <Link href="/checkout" className="hover:underline">
          2. Delivery &amp; Address
        </Link>
        <span>&gt;</span>
        <span className="font-bold text-[#222222]">3. Payment &amp; Review</span>
        <span>&gt;</span>
        <span>4. Confirmation</span>
      </div>

      <div className="border-b border-[#EBEBEB] pb-4">
        <h1 className="text-2xl font-black text-[#222222]">Payment &amp; Final Review</h1>
        <p className="text-xs text-[#717171] mt-0.5">
          Select payment method and verify warehouse stock allocation.
        </p>
      </div>

      <form onSubmit={handlePayNow} className="space-y-8">
        {/* Payment Method Selector */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-[#222222] uppercase tracking-wider block">
            Select Payment Method
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Card Payment */}
            <div
              onClick={() => updateCheckoutData({ paymentMethod: "card" })}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 bg-white ${checkoutData.paymentMethod === "card"
                ? "border-[#222222] ring-1 ring-[#222222] shadow-sm"
                : "border-[#DDDDDD] hover:border-[#222222]"
                }`}
            >
              <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
                <CreditCard className="w-4 h-4 text-[#FF385C]" />
                <span>Card Payment (Online)</span>
              </div>
              <p className="text-[#717171] text-xs leading-relaxed">
                Pay online using Visa, Mastercard, or American Express with immediate stock locking.
              </p>
            </div>

            {/* Cash on Delivery */}
            <div
              onClick={() => updateCheckoutData({ paymentMethod: "cod" })}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 bg-white ${checkoutData.paymentMethod === "cod"
                ? "border-[#222222] ring-1 ring-[#222222] shadow-sm"
                : "border-[#DDDDDD] hover:border-[#222222]"
                }`}
            >
              <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
                <Banknote className="w-4 h-4 text-[#FF385C]" />
                <span>Cash on Delivery (COD)</span>
              </div>
              <p className="text-[#717171] text-xs leading-relaxed">
                Pay in cash upon doorstep delivery by courier or at store pickup counter.
              </p>
            </div>
          </div>

          {/* Card fields if Card chosen */}
          {checkoutData.paymentMethod === "card" && (
            <div className="border border-[#DDDDDD] rounded-2xl p-5 space-y-3 text-xs bg-[#F7F7F7]">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[#222222] font-bold mb-1 text-xs">
                    Card Number
                  </label>
                  <input
                    type="text"
                    value={checkoutData.cardNumber}
                    onChange={(e) => updateCheckoutData({ cardNumber: e.target.value })}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-3 font-mono text-xs text-[#222222]"
                  />
                </div>
                <div>
                  <label className="block text-[#222222] font-bold mb-1 text-xs">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={checkoutData.cardExpiry}
                    onChange={(e) => updateCheckoutData({ cardExpiry: e.target.value })}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-3 font-mono text-xs text-[#222222]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Itemized Order Review */}
        <div className="border border-[#DDDDDD] rounded-2xl p-6 space-y-4 text-xs bg-white shadow-sm">
          <div className="font-bold text-[#222222] text-xs flex items-center justify-between border-b border-[#EBEBEB] pb-3">
            <span>Itemized Allocation ({cartItems.length} items)</span>
            <span className="text-[#717171] font-normal">
              Fulfillment:{" "}
              {checkoutData.deliveryMode === "pickup"
                ? `Store Pickup (${selectedStore.name})`
                : `Delivery to ${checkoutData.shippingCity}, TX`}
            </span>
          </div>

          <div className="divide-y divide-[#EBEBEB]">
            {cartItems.map((item) => (
              <div
                key={`${item.product.id}-${item.variant.id}`}
                className="py-3 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-[#222222] text-sm">{item.product.name}</div>
                  <div className="text-xs text-[#717171]">
                    Variant: {item.variant.name} • SKU: {item.variant.sku} × {item.quantity}
                  </div>
                </div>
                <div className="font-bold text-[#222222] text-sm">
                  ${(item.variant.price * item.quantity).toFixed(2)}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-[#EBEBEB] space-y-2 text-xs text-[#717171]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-[#222222]">${cartSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Texas State Sales Tax (8.25%)</span>
              <span className="font-bold text-[#222222]">${texasSalesTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="font-bold text-[#222222]">
                {shippingFee === 0 ? "FREE" : `$${shippingFee.toFixed(2)}`}
              </span>
            </div>
            <div className="pt-3 border-t border-[#EBEBEB] flex justify-between items-baseline text-sm font-black text-[#222222]">
              <span>Total Payable</span>
              <span className="text-2xl text-[#222222]">
                ${totalDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Central Warehouse Atomic Validation Guarantee */}
        <div className="border border-[#DDDDDD] rounded-2xl p-4 flex items-start gap-3 text-xs bg-[#F7F7F7]">
          <Warehouse className="w-5 h-5 text-[#FF385C] shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="font-bold text-[#222222]">Atomic Stock Deduction Guarantee</div>
            <p className="text-[#717171] text-xs leading-relaxed">
              Upon clicking "Confirm &amp; Place Order", warehouse inventory for each specified SKU
              is atomically decremented in our central Texas database to eliminate stock mismatches.
            </p>
          </div>
        </div>

        {/* Navigation & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
          <Link
            href="/checkout"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#222222] hover:underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Address</span>
          </Link>

          <button
            type="submit"
            disabled={processing}
            className="py-3.5 px-6 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-colors shadow-md disabled:opacity-50"
          >
            {processing ? (
              <span>Reserving Stock &amp; Confirming...</span>
            ) : (
              <>
                <span>Confirm &amp; Place Order (${totalDue.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}
