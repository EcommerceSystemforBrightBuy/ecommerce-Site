"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { STORE_PICKUP_LOCATIONS } from "@/data/mockData";
import {
  CheckCircle2,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Warehouse,
  ArrowRight,
  Printer,
  PackageCheck,
  ShoppingBag,
} from "lucide-react";

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const queryOrderId = searchParams.get("orderId");
  const { lastOrder, currentUser } = useShop();

  const [order, setOrder] = useState(lastOrder || null);
  const [loading, setLoading] = useState(true);

  const singleStore = STORE_PICKUP_LOCATIONS[0];

  useEffect(() => {
    let isMounted = true;

    async function resolveOrder() {
      // 1. If orderId is provided in URL, fetch live data from backend MySQL API
      if (queryOrderId) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:8000";
          const res = await fetch(`${baseUrl}/api/orders/${queryOrderId}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.order) {
              const liveOrder = {
                orderId: data.order.order_id,
                date: data.order.order_date
                  ? new Date(data.order.order_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })
                  : new Date().toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }),
                customer: {
                  name:
                    data.order.customer_name ||
                    currentUser?.name ||
                    "Valued Customer",
                  email:
                    data.order.customer_email ||
                    currentUser?.email ||
                    "customer@brightbuy.tx",
                  phone: data.order.customer_phone || "",
                },
                deliveryMode:
                  data.order.delivery_mode === "Store Pickup" ? "pickup" : "standard",
                paymentMethod: data.order.payment_method?.toLowerCase().includes("cash")
                  ? "cod"
                  : "card",
                paymentStatus: data.order.payment_status || "completed",
                shippingCity: data.order.city_name || "Austin",
                streetAddress: data.order.address_line || "Standard Shipping Address",
                totalDue: parseFloat(data.order.total_amount || 0),
                estimatedArrival: data.order.estimated_delivery_date
                  ? `Estimated ${new Date(data.order.estimated_delivery_date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}`
                  : "In 5 Business Days",
                items: Array.isArray(data.items)
                  ? data.items.map((it) => ({
                    product: { name: it.product_name },
                    variant: {
                      name: it.variant_name || "Standard",
                      sku: it.sku || "-",
                      price: parseFloat(it.unit_price || 0),
                    },
                    quantity: it.quantity || 1,
                  }))
                  : [],
              };

              if (isMounted) {
                setOrder(liveOrder);
                setLoading(false);
                return;
              }
            }
          }
        } catch (err) {
          console.error("Error fetching live order:", err);
        }
      }

      // 2. Check lastOrder from ShopContext state
      if (lastOrder && lastOrder.orderId) {
        if (isMounted) {
          setOrder(lastOrder);
          setLoading(false);
          return;
        }
      }

      // 3. Check browser localStorage for last recorded order
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem("brightbuy_last_order");
          if (stored) {
            const parsed = JSON.parse(stored);
            if (parsed && parsed.orderId) {
              if (isMounted) {
                setOrder(parsed);
                setLoading(false);
                return;
              }
            }
          }
        } catch { }
      }

      // 4. If current user is logged in, fetch their latest real order from DB
      if (currentUser?.customerId) {
        try {
          const baseUrl = process.env.NEXT_PUBLIC_URL || "http://localhost:8000";
          const res = await fetch(`${baseUrl}/api/orders?customer_id=${currentUser.customerId}`);
          if (res.ok) {
            const list = await res.json();
            if (Array.isArray(list) && list.length > 0) {
              const latest = list[0];
              // Fetch full detail for this latest order
              const detailRes = await fetch(`${baseUrl}/api/orders/${latest.order_id}`);
              if (detailRes.ok) {
                const detailData = await detailRes.json();
                if (detailData.success && detailData.order) {
                  const dbOrder = {
                    orderId: detailData.order.order_id,
                    date: detailData.order.order_date
                      ? new Date(detailData.order.order_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })
                      : "Recent",
                    customer: {
                      name: detailData.order.customer_name || currentUser.name,
                      email: detailData.order.customer_email || currentUser.email,
                    },
                    deliveryMode:
                      detailData.order.delivery_mode === "Store Pickup" ? "pickup" : "standard",
                    paymentMethod: detailData.order.payment_method?.toLowerCase().includes("cash")
                      ? "cod"
                      : "card",
                    shippingCity: detailData.order.city_name || "Austin",
                    streetAddress: detailData.order.address_line || "",
                    totalDue: parseFloat(detailData.order.total_amount || 0),
                    estimatedArrival: detailData.order.estimated_delivery_date
                      ? `Estimated ${new Date(detailData.order.estimated_delivery_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}`
                      : "In 5 Business Days",
                    items: Array.isArray(detailData.items)
                      ? detailData.items.map((it) => ({
                        product: { name: it.product_name },
                        variant: {
                          name: it.variant_name || "Standard",
                          sku: it.sku || "-",
                          price: parseFloat(it.unit_price || 0),
                        },
                        quantity: it.quantity || 1,
                      }))
                      : [],
                  };

                  if (isMounted) {
                    setOrder(dbOrder);
                    setLoading(false);
                    return;
                  }
                }
              }
            }
          }
        } catch (err) {
          console.error("Error fetching customer recent order:", err);
        }
      }

      if (isMounted) {
        setLoading(false);
      }
    }

    resolveOrder();

    return () => {
      isMounted = false;
    };
  }, [queryOrderId, lastOrder, currentUser]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center space-y-4">
        <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#FF385C]/20 border-t-[#FF385C] mx-auto" />
        <p className="text-xs font-bold text-[#717171]">Retrieving your Texas Central Warehouse order record...</p>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="max-w-md mx-auto my-16 p-8 text-center bg-white rounded-3xl border border-[#DDDDDD] shadow-sm space-y-4">
        <div className="w-14 h-14 bg-neutral-100 text-neutral-500 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-7 h-7" />
        </div>
        <h2 className="text-xl font-black text-[#222222]">No Recent Order Found</h2>
        <p className="text-xs text-[#717171]">
          We could not locate an active order confirmation in this session.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/products"
            className="px-5 py-2.5 bg-[#222222] text-white text-xs font-bold rounded-full hover:bg-black transition-colors"
          >
            Browse Products
          </Link>
          {currentUser && (
            <Link
              href="/account/orders"
              className="px-5 py-2.5 bg-white border border-[#DDDDDD] text-[#222222] text-xs font-bold rounded-full hover:border-[#222222] transition-colors"
            >
              View Order History
            </Link>
          )}
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-8 animate-fade-in">
      {/* Success Badge */}
      <div className="border border-[#DDDDDD] rounded-3xl p-8 text-center space-y-3 bg-white shadow-sm">
        <div className="w-14 h-14 bg-[#FF385C] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-[#222222]">Order Confirmed &amp; Reserved</h1>
        <p className="text-xs text-[#717171] max-w-md mx-auto">
          Your order is securely registered in the BrightBuy Texas database. Central warehouse stock
          has been atomically decremented.
        </p>
        <div className="inline-block mt-2 px-4 py-1.5 bg-[#F7F7F7] font-mono text-xs font-bold text-[#222222] border border-[#DDDDDD] rounded-full">
          Order ID: {order.orderId}
        </div>
      </div>

      {/* Fulfillment Status Card */}
      <div className="border border-[#DDDDDD] rounded-3xl p-6 space-y-4 text-xs bg-white">
        <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
          <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
            {order.deliveryMode === "pickup" ? (
              <Store className="w-4 h-4 text-[#FF385C]" />
            ) : (
              <Truck className="w-4 h-4 text-[#FF385C]" />
            )}
            <span>
              {order.deliveryMode === "pickup"
                ? "Central Store Pickup Counter"
                : "Standard Texas Ground Delivery"}
            </span>
          </div>
          <span className="font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-[10px]">
            Status: Queued for Dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[#717171] text-[11px] font-bold uppercase">
              {order.deliveryMode === "pickup" ? "Pickup Store Location" : "Delivery Destination"}
            </div>
            <div className="font-bold text-[#222222] text-sm mt-0.5">
              {order.deliveryMode === "pickup"
                ? singleStore.name
                : `${order.shippingCity}, Texas`}
            </div>
            <div className="text-[#717171] text-xs mt-0.5">
              {order.deliveryMode === "pickup"
                ? singleStore.address
                : order.streetAddress || "Registered Texas Delivery Address"}
            </div>
          </div>

          <div>
            <div className="text-[#717171] text-[11px] font-bold uppercase">Estimated Timeline</div>
            <div className="font-bold text-[#FF385C] text-sm mt-0.5">
              {order.estimatedArrival}
            </div>
            <div className="text-[#717171] text-xs mt-0.5">
              {order.deliveryMode === "pickup"
                ? "Ready in 24 hours at Central Store counter"
                : "Dispatched from Central Warehouse in Austin (Free Statewide Delivery)"}
            </div>
          </div>
        </div>
      </div>

      {/* Payment and Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="border border-[#DDDDDD] rounded-2xl p-5 space-y-1 bg-white">
          <div className="text-[#717171] text-[11px] font-bold uppercase">Payment Method</div>
          <div className="font-bold text-[#222222] flex items-center gap-1.5">
            {order.paymentMethod === "card" ? (
              <>
                <CreditCard className="w-3.5 h-3.5 text-[#FF385C]" /> Card Payment (Paid Online)
              </>
            ) : (
              <>
                <Banknote className="w-3.5 h-3.5 text-[#FF385C]" /> Cash on Delivery (Pay at Arrival)
              </>
            )}
          </div>
          <div className="text-[#222222] font-bold text-xs pt-1">
            Total Paid: ${Number(order.totalDue || 0).toFixed(2)}
          </div>
        </div>

        <div className="border border-[#DDDDDD] rounded-2xl p-5 space-y-1 bg-white">
          <div className="text-[#717171] text-[11px] font-bold uppercase">Customer Account</div>
          <div className="font-bold text-[#222222]">{order.customer?.name || "Customer"}</div>
          <div className="text-[#717171] text-xs">
            {order.customer?.email || "customer@brightbuy.tx"}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="border border-[#DDDDDD] rounded-3xl p-6 space-y-3 text-xs bg-white">
        <div className="font-bold text-[#222222] uppercase text-[11px] border-b border-[#EBEBEB] pb-2">
          Purchased Items &amp; Warehouse SKU Mapping
        </div>
        <div className="divide-y divide-[#EBEBEB]">
          {order.items && order.items.length > 0 ? (
            order.items.map((item, idx) => (
              <div key={idx} className="py-2.5 flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#222222]">
                    {item.product?.name || "Hardware Unit"}
                  </span>
                  <div className="text-xs text-[#717171]">
                    {item.variant?.name || "Standard"} • SKU: {item.variant?.sku || "-"} × {item.quantity || 1}
                  </div>
                </div>
                <span className="font-bold text-[#222222]">
                  ${((item.variant?.price || 0) * (item.quantity || 1)).toFixed(2)}
                </span>
              </div>
            ))
          ) : (
            <div className="py-3 text-xs text-[#717171] italic">
              Order items recorded in central warehouse manifest.
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#222222] hover:underline cursor-pointer"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt</span>
        </button>

        <Link
          href="/products"
          className="py-3 px-6 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold rounded-full flex items-center gap-2 transition-colors shadow-md"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <main className="max-w-3xl mx-auto px-4 sm:px-8 py-20 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-3 border-[#FF385C]/20 border-t-[#FF385C] mx-auto" />
          <p className="text-xs font-bold text-[#717171] mt-3">Loading order confirmation...</p>
        </main>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
