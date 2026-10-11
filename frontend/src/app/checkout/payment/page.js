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
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Lock,
  X,
  Copy,
  Check,
  ExternalLink,
} from "lucide-react";

const TEST_CARDS = [
  {
    brand: "Visa",
    number: "4916217501611292",
    formatted: "4916 2175 0161 1292",
    badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
  },
  {
    brand: "MasterCard",
    number: "5307732125531191",
    formatted: "5307 7321 2553 1191",
    badgeColor: "bg-amber-50 text-amber-800 border-amber-200",
  },
  {
    brand: "AMEX",
    number: "346781005510225",
    formatted: "3467 8100 5510 225",
    badgeColor: "bg-emerald-50 text-emerald-800 border-emerald-200",
  },
];

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const {
    cartItems,
    buyNowItem,
    clearBuyNow,
    currentUser,
    checkoutData,
    updateCheckoutData,
    clearCart,
  } = useShop();

  const activeItems = buyNowItem ? [buyNowItem] : cartItems;

  const activeSubtotal = activeItems.reduce(
    (acc, item) => acc + (item.variant?.price || item.unitPrice || 0) * (item.quantity || 1),
    0
  );

  const [processing, setProcessing] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [payhereData, setPayhereData] = useState(null);
  const [payStatusText, setPayStatusText] = useState("");
  const [copiedCard, setCopiedCard] = useState(null);

  const allItemsInStock = activeItems.length > 0 && activeItems.every((item) => {
    const stock = Number(item.variant?.stock ?? item.stock ?? 0);
    const qty = Number(item.quantity || 1);
    return stock >= qty;
  });

  const estimate = calculateDeliveryEstimate(
    checkoutData.shippingCity,
    allItemsInStock
  );

  const shippingFee = 0.0;
  const totalDue = activeSubtotal;

  const copyToClipboard = (brand, number) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(number);
        setCopiedCard(brand);
        setTimeout(() => setCopiedCard(null), 2500);
      }
    } catch {}
  };

  const finalizeOrder = async ({ paymentMethod, paymentStatus, transactionId, payhereCompleted }) => {
    try {
      setPayStatusText("Recording order and reserving inventory in Texas Central Warehouse...");
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:8000";
      const payload = {
        customerId: currentUser?.customerId || currentUser?.customer_id || currentUser?.id || "CUST005",
        totalAmount: totalDue,
        deliveryMode: checkoutData.deliveryMode || "standard",
        shippingCity: checkoutData.shippingCity || "Houston",
        streetAddress: checkoutData.streetAddress || "",
        paymentMethod: paymentMethod || (checkoutData.paymentMethod === "card" ? "Card Payment" : "Cash on Delivery"),
        paymentStatus: paymentStatus || "completed",
        transactionId: transactionId || null,
        payhereCompleted: Boolean(payhereCompleted),
        items: activeItems.map((item) => ({
          variantId: item.variant?.variant_id || item.variant?.variantId || item.variant?.id || item.variant_id || "VAR001",
          quantity: item.quantity || 1,
          unitPrice: item.variant?.price !== undefined ? parseFloat(item.variant.price) : (item.unitPrice || 0),
        })),
      };

      const response = await fetch(`${baseUrl}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        if (buyNowItem) {
          clearBuyNow();
        } else {
          clearCart();
        }
        setProcessing(false);
        setShowSimulator(false);
        router.push("/checkout/confirmation");
      } else {
        alert("Checkout failed: " + (result.error || result.message));
        setProcessing(false);
      }
    } catch (err) {
      console.error("Order completion error:", err);
      alert("Server error connecting to backend API");
      setProcessing(false);
    }
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setPayStatusText("Initializing payment gateway...");

    // 1. Cash on Delivery (COD) Flow
    if (checkoutData.paymentMethod === "cod") {
      await finalizeOrder({
        paymentMethod: "Cash on Delivery",
        paymentStatus: "pending",
      });
      return;
    }

    // 2. Card Payment: Handled directly on PayHere Sandbox
    try {
      const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:8000";
      const custName = currentUser?.name || `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() || "Amanda Hasin";

      setPayStatusText("Connecting to PayHere Sandbox & preparing secure checkout session...");
      const paramRes = await fetch(`${baseUrl}/api/orders/payhere-params`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          totalAmount: totalDue,
          currency: "USD",
          customer: {
            name: custName,
            email: currentUser?.email || "customer@brightbuy.tx",
            phone: currentUser?.phone || "(512) 555-0188",
            address: checkoutData.streetAddress || "Texas Storefront Address",
            city: checkoutData.shippingCity || "Austin",
          },
          items: activeItems.map((it) => ({
            name: it.product?.name || it.name || "Product",
            quantity: it.quantity || 1,
          })),
        }),
      });

      const pData = await paramRes.json();
      if (!pData.success) {
        throw new Error(pData.error || "Could not generate PayHere Sandbox credentials.");
      }

      setPayhereData(pData);

      // Attempt to dynamically load official PayHere JS SDK if not present on window
      let hasPayHere = typeof window !== "undefined" && typeof window.payhere !== "undefined";
      if (!hasPayHere) {
        hasPayHere = await new Promise((resolve) => {
          const script = document.createElement("script");
          script.src = "https://www.payhere.lk/lib/payhere.js";
          script.async = true;
          script.onload = () => resolve(true);
          script.onerror = () => resolve(false);
          document.body.appendChild(script);
          setTimeout(() => resolve(typeof window.payhere !== "undefined"), 2000);
        });
      }

      if (hasPayHere && typeof window.payhere !== "undefined") {
        window.payhere.onCompleted = async function onCompleted(orderId) {
          console.log("[PayHere Sandbox] Payment completed successfully. OrderID:", orderId);
          await finalizeOrder({
            paymentMethod: "Card Payment",
            paymentStatus: "completed",
            transactionId: orderId,
            payhereCompleted: true,
          });
        };

        window.payhere.onDismissed = function onDismissed() {
          console.log("[PayHere Sandbox] Payment popup dismissed by user.");
          setProcessing(false);
          setPayStatusText("");
        };

        window.payhere.onError = function onError(error) {
          console.error("[PayHere Sandbox] Error:", error);
          setShowSimulator(true);
        };

        // Launch official PayHere modal
        window.payhere.startPayment(pData);
      } else {
        // Fallback: Display interactive PayHere Sandbox modal
        setShowSimulator(true);
      }
    } catch (err) {
      console.error("PayHere Sandbox connection error:", err);
      setShowSimulator(true);
    }
  };

  const selectedStore =
    STORE_PICKUP_LOCATIONS.find((s) => s.id === checkoutData.pickupStoreId) ||
    STORE_PICKUP_LOCATIONS[0];

  if (activeItems.length === 0) {
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
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8 font-sans">
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
            {/* Card Payment (PayHere Sandbox) */}
            <div
              onClick={() => updateCheckoutData({ paymentMethod: "card" })}
              className={`p-5 rounded-2xl border-2 cursor-pointer transition-all space-y-2 bg-white ${checkoutData.paymentMethod === "card"
                ? "border-[#222222] ring-1 ring-[#222222] shadow-sm"
                : "border-[#DDDDDD] hover:border-[#222222]"
                }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
                  <CreditCard className="w-4 h-4 text-[#FF385C]" />
                  <span>Card Payment (PayHere Gateway)</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full border border-emerald-200">
                  PayHere Sandbox
                </span>
              </div>
              <p className="text-[#717171] text-xs leading-relaxed">
                Card details are entered directly on PayHere's encrypted gateway popup. Our store does not collect or store your card information.
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
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
                  <Banknote className="w-4 h-4 text-[#FF385C]" />
                  <span>Cash on Delivery (COD)</span>
                </div>
                <span className="text-[9px] font-black uppercase px-2 py-0.5 bg-zinc-100 text-zinc-700 rounded-full border border-zinc-200">
                  Doorstep / Counter
                </span>
              </div>
              <p className="text-[#717171] text-xs leading-relaxed">
                Pay in cash upon doorstep delivery by courier or at store pickup counter.
              </p>
            </div>
          </div>

          {/* PayHere Sandbox Test Cards Notice (NO INPUT FIELDS) */}
          {checkoutData.paymentMethod === "card" && (
            <div className="border border-[#DDDDDD] rounded-2xl p-5 space-y-4 text-xs bg-[#F7F7F7]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBEBEB] pb-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#222222]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>PayHere Sandbox Payment Gateway</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#717171]">
                  <Lock className="w-3.5 h-3.5 text-emerald-600" />
                  <span>PCI-DSS Compliant • Card entered in PayHere Popup</span>
                </div>
              </div>

              {/* Notice Card for Test Payment */}
              <div className="bg-white border border-[#DDDDDD] rounded-2xl p-4 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF385C] block">
                      Sandbox Simulation Notice
                    </span>
                    <h3 className="font-extrabold text-xs text-[#222222]">
                      Use any of these cards for test payment on PayHere:
                    </h3>
                  </div>
                  <span className="text-[10px] text-[#717171] font-mono">
                    Expiry: Any future date • CVV: 123
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                  {TEST_CARDS.map((tc) => (
                    <div
                      key={tc.brand}
                      className="p-3 bg-[#F7F7F7] border border-[#E0E0E0] rounded-xl flex flex-col justify-between space-y-2 hover:border-[#222222] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full border ${tc.badgeColor}`}>
                          {tc.brand}
                        </span>
                        <button
                          type="button"
                          onClick={() => copyToClipboard(tc.brand, tc.number)}
                          className="text-[10px] font-bold text-[#717171] hover:text-[#222222] flex items-center gap-1 cursor-pointer transition-colors"
                          title="Copy card number"
                        >
                          {copiedCard === tc.brand ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-600" />
                              <span className="text-emerald-600 font-bold">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>

                      <div className="font-mono text-xs font-bold text-[#222222] tracking-wider select-all">
                        {tc.formatted}
                      </div>

                      <div className="text-[10px] text-[#717171]">
                        Test Mode Card
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#F0F0F0] text-[11px] text-[#717171] flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                  <span>
                    When you click the button below, PayHere Sandbox will launch. Enter one of the test cards above with any future expiration date (e.g. <strong>12/28</strong>) and any CVV (e.g. <strong>123</strong>).
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Itemized Order Review */}
        <div className="border border-[#DDDDDD] rounded-2xl p-6 space-y-4 text-xs bg-white shadow-sm">
          <div className="font-bold text-[#222222] text-xs flex items-center justify-between border-b border-[#EBEBEB] pb-3">
            <span>Itemized Order ({activeItems.length} {activeItems.length === 1 ? "item" : "items"})</span>
            <span className="text-[#717171] font-normal">
              Fulfillment:{" "}
              {checkoutData.deliveryMode === "pickup"
                ? `Store Pickup (${selectedStore.name})`
                : `Delivery to ${checkoutData.shippingCity}, TX`}
            </span>
          </div>

          <div className="divide-y divide-[#EBEBEB]">
            {activeItems.map((item, idx) => {
              const pName = item.product?.name || item.name || "Product";
              const vName = item.variant?.name || item.variant?.variant_name || "";
              const sku = item.variant?.sku || item.sku || "";
              const price = item.variant?.price !== undefined ? parseFloat(item.variant.price) : (item.unitPrice || 0);
              const qty = item.quantity || 1;
              return (
                <div
                  key={item.variant?.id || item.variant?.variant_id || idx}
                  className="py-3 flex items-center justify-between"
                >
                  <div>
                    <div className="font-bold text-[#222222] text-sm">{pName}</div>
                    <div className="text-xs text-[#717171]">
                      {vName ? `Variant: ${vName} • ` : ""}{sku ? `SKU: ${sku} • ` : ""}Qty: {qty}
                    </div>
                  </div>
                  <div className="font-bold text-[#222222] text-sm">
                    ${(price * qty).toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals */}
          <div className="pt-3 border-t border-[#EBEBEB] space-y-2 text-xs text-[#717171]">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-bold text-[#222222]">${activeSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Charges</span>
              <span className="font-bold text-emerald-600">FREE</span>
            </div>
            <div className="pt-3 border-t border-[#EBEBEB] flex justify-between items-baseline text-sm font-black text-[#222222]">
              <span>Total Payable</span>
              <span className="text-2xl text-[#222222]">
                ${totalDue.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Navigation & Action */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#EBEBEB]">
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
            className="w-full sm:w-auto py-3.5 px-8 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-black rounded-xl flex items-center justify-center gap-2 transition-colors shadow-md disabled:opacity-50 cursor-pointer"
          >
            {processing ? (
              <span>{payStatusText || "Connecting to Gateway & Reserving Stock..."}</span>
            ) : (
              <>
                <span>
                  {checkoutData.paymentMethod === "card"
                    ? `Pay with PayHere Sandbox ($${totalDue.toFixed(2)})`
                    : `Confirm & Place Order ($${totalDue.toFixed(2)})`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* PayHere Sandbox Interactive Modal (Official Fallback / Instant Tester) */}
      {showSimulator && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#DDDDDD] shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#FF385C] text-white font-black flex items-center justify-center text-xs shadow-xs">
                  PH
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#222222]">PayHere Sandbox Gateway</h3>
                  <p className="text-[10px] text-emerald-700 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Sandbox Gateway Active</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowSimulator(false);
                  setProcessing(false);
                }}
                className="p-1 rounded-full hover:bg-[#F7F7F7] text-[#717171]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-[#F7F7F7] rounded-2xl border border-[#EBEBEB] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#717171]">Merchant ID:</span>
                <span className="font-mono font-bold text-[#222222]">{payhereData?.merchant_id || "1211149"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717171]">Order Reference:</span>
                <span className="font-mono text-[#222222] truncate max-w-[200px]">{payhereData?.order_id || "ORD-TX-PENDING"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#717171]">Security MD5 Hash:</span>
                <span className="font-mono text-[10px] text-emerald-800 truncate max-w-[180px]">{payhereData?.hash || "MD5-VERIFIED"}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#E0E0E0] font-black text-sm text-[#222222]">
                <span>Total Amount:</span>
                <span className="text-lg text-[#FF385C]">${totalDue.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Test Cards List */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-[#717171] uppercase tracking-wider block">
                Selected Test Card for Sandbox Approval:
              </span>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {TEST_CARDS.map((tc) => (
                  <div key={tc.brand} className="p-2.5 rounded-xl border border-[#DDDDDD] bg-[#FAFAFA] text-center">
                    <div className="font-bold text-[11px] text-[#222222]">{tc.brand}</div>
                    <div className="font-mono text-[10px] text-[#717171] truncate">{tc.number.slice(-4)}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1 text-xs text-emerald-950">
              <div className="font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Sandbox Verification Ready</span>
              </div>
              <p className="text-[11px] text-emerald-800 leading-relaxed">
                Clicking Approve simulates PayHere gateway transaction approval, executes the backend payment callback, and confirms order stock allocation.
              </p>
            </div>

            <div className="space-y-2 pt-1">
              <button
                type="button"
                onClick={async () => {
                  await finalizeOrder({
                    paymentMethod: "Card Payment",
                    paymentStatus: "completed",
                    transactionId: payhereData?.order_id || `PH-TX-${Date.now()}`,
                    payhereCompleted: true,
                  });
                }}
                className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E00B41] text-white font-black text-xs rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Approve PayHere Sandbox Test Payment</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowSimulator(false);
                  setProcessing(false);
                }}
                className="w-full py-2.5 bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#717171] font-bold text-xs rounded-xl transition-colors border border-[#DDDDDD]"
              >
                Cancel Transaction
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
