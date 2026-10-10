"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import {
  ShoppingBag,
  Truck,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  ChevronRight,
  Sparkles,
  ArrowLeft,
  X,
} from "lucide-react";

export default function CustomerOrdersPage() {
  const { currentUser, authReady } = useShop();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal State for Submitting Feedback / Review
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: "", text: "" });

  const [orderItemsMap, setOrderItemsMap] = useState({});

  useEffect(() => {
    if (!currentUser?.customerId) {
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/api/orders?customer_id=${encodeURIComponent(
            currentUser.customerId
          )}`
        );
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.error || "Failed to load your orders.");
        }
        setOrders(result.data || []);

        const itemsMap = {};
        for (const order of result.data || []) {
          try {
            const detailRes = await fetch(
              `${process.env.NEXT_PUBLIC_URL}/api/orders/${encodeURIComponent(order.order_id)}`
            );
            const detailData = await detailRes.json();
            if (detailRes.ok && detailData.success) {
              itemsMap[order.order_id] = detailData.items || [];
            }
          } catch (e) {
            console.error(`Failed to load items for order ${order.order_id}`, e);
          }
        }
        setOrderItemsMap(itemsMap);
      } catch (err) {
        console.error("Customer orders fetch error:", err);
        setError(err.message || "Failed to load orders.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [currentUser]);

  const openReviewModal = (product) => {
    setSelectedProduct(product);
    setRating(5);
    setReviewText("");
    setReviewMessage({ type: "", text: "" });
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmittingReview(true);
    setReviewMessage({ type: "", text: "" });

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.product_id || selectedProduct.productId || selectedProduct.id,
          product_id: selectedProduct.product_id || selectedProduct.productId || selectedProduct.id,
          customerId: currentUser?.customerId || "CUST005",
          rating: Number(rating),
          review: reviewText,
        }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setReviewMessage({
          type: "error",
          text: result.error || "Failed to submit review. Please try again.",
        });
        return;
      }

      setReviewMessage({
        type: "success",
        text: "Thank you! Your feedback has been submitted successfully.",
      });
      setTimeout(() => {
        setReviewModalOpen(false);
      }, 1800);
    } catch (err) {
      console.error("Submit review error:", err);
      setReviewMessage({
        type: "error",
        text: "Could not connect to server.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!authReady || loading) {
    return (
      <main className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#FF385C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs font-semibold text-[#717171]">Loading your Texas order history...</p>
      </main>
    );
  }

  if (!currentUser) {
    return (
      <main className="max-w-md mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-[#222222]">Sign in to view your orders</h1>
        <p className="text-xs text-[#717171]">
          Please log into your BrightBuy Texas account to view order statuses and leave product feedback.
        </p>
        <Link
          href="/login?redirect=/account/orders"
          className="inline-block bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold px-8 py-3.5 rounded-full transition-colors shadow-sm"
        >
          Sign In Now
        </Link>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-[#FF385C] font-bold uppercase tracking-wider">
            <Link href="/account" className="hover:underline flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Profile
            </Link>
          </div>
          <h1 className="text-3xl font-black text-[#222222] mt-1">My Orders</h1>
          <p className="text-xs text-[#717171] mt-1">
            Track your order dispatches, Texas courier status, and share product reviews.
          </p>
        </div>
        <div className="bg-[#F7F7F7] border border-[#DDDDDD] px-4 py-2 rounded-2xl text-center">
          <span className="block text-2xl font-black text-[#222222]">{orders.length}</span>
          <span className="text-[10px] font-bold text-[#717171] uppercase">Total Orders</span>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-800 text-xs font-bold">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
        <div className="text-center py-16 bg-[#F7F7F7] rounded-3xl border border-[#DDDDDD] p-8 space-y-4">
          <ShoppingBag className="w-12 h-12 text-[#717171] mx-auto opacity-50" />
          <h2 className="text-lg font-bold text-[#222222]">No orders placed yet</h2>
          <p className="text-xs text-[#717171] max-w-sm mx-auto">
            You haven&apos;t placed any orders with Texas Central Warehouse yet. Discover hardware, electronics and toys today!
          </p>
          <Link
            href="/products"
            className="inline-block bg-[#222222] hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-xl transition-colors"
          >
            Explore Catalog
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const isStorePickup =
              order.delivery_mode?.toLowerCase().includes("pickup") ||
              order.delivery_mode?.toLowerCase().includes("store");
            const items = orderItemsMap[order.order_id] || [];

            return (
              <div
                key={order.order_id}
                className="bg-white border border-[#DDDDDD] rounded-3xl p-6 shadow-xs hover:shadow-md transition-all space-y-6"
              >
                {/* Top Row: Order ID, Date, Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black font-mono text-[#222222]">
                        Order #{order.order_id}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-[#F7F7F7] border border-[#DDDDDD] text-[#717171]">
                        {new Date(order.order_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <p className="text-xs text-[#717171] font-medium flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-[#FF385C]" />
                      <span>
                        Fulfillment:{" "}
                        <strong className="text-[#222222]">
                          {isStorePickup ? "Central Store Pickup" : "Standard Texas Delivery"}
                        </strong>
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${
                        order.delivery_status?.toLowerCase() === "delivered"
                          ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                          : order.delivery_status?.toLowerCase() === "dispatched"
                          ? "bg-blue-50 border-blue-300 text-blue-800"
                          : "bg-amber-50 border-amber-300 text-amber-800"
                      }`}
                    >
                      {order.delivery_status || "Processing"}
                    </span>
                    <span className="text-lg font-black text-[#222222]">
                      ${Number(order.total_amount || 0).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Delivery & Destination Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#F7F7F7] p-4 rounded-2xl border border-[#EBEBEB]">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#717171] block mb-1">
                      {isStorePickup ? "Store Pickup Location" : "Customer Shipping Address"}
                    </span>
                    <p className="font-bold text-[#222222] flex items-start gap-1.5">
                      <MapPin className="w-4 h-4 text-[#FF385C] shrink-0 mt-0.5" />
                      <span>
                        {order.address_line
                          ? `${order.address_line}, ${order.city_name || "TX"} ${
                              order.postal_code || ""
                            }`
                          : `${order.city_name || "Austin"}, TX - Standard Texas Central Logistics`}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#717171] block mb-1">
                      Estimated Delivery Date
                    </span>
                    <p className="font-bold text-[#222222] flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-[#FF385C] shrink-0" />
                      <span>
                        {order.estimated_delivery_date
                          ? new Date(order.estimated_delivery_date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })
                          : "Calculated at warehouse dispatch"}
                      </span>
                    </p>
                  </div>
                </div>

                {/* Order Items & Feedback Option */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold text-[#222222] uppercase tracking-wider">
                    Purchased Items &amp; Product Feedback
                  </h3>

                  {items.length === 0 ? (
                    <p className="text-xs text-[#717171] font-mono">
                      Warehouse SKUs: {order.skus || "N/A"}
                    </p>
                  ) : (
                    <div className="divide-y divide-[#EBEBEB] border-t border-b border-[#EBEBEB]">
                      {items.map((item, idx) => (
                        <div
                          key={idx}
                          className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#F7F7F7] border border-[#DDDDDD] flex items-center justify-center font-bold text-[#FF385C] shrink-0">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                            <div>
                              <Link
                                href={`/products/${item.product_id}`}
                                className="font-bold text-[#222222] hover:text-[#FF385C] transition-colors block"
                              >
                                {item.product_name || "Texas Hardware Unit"}
                              </Link>
                              <div className="text-[11px] text-[#717171] flex items-center gap-2">
                                <span>Variant: {item.variant_name || "Standard"}</span>
                                <span>•</span>
                                <span className="font-mono">SKU: {item.sku}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0">
                            <div className="text-right">
                              <span className="font-bold text-[#222222]">
                                Qty: {item.quantity}
                              </span>
                              <span className="block text-[11px] text-[#717171]">
                                ${Number(item.price || 0).toFixed(2)} each
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => openReviewModal(item)}
                              className="flex items-center gap-1.5 bg-[#F7F7F7] hover:bg-[#FF385C] hover:text-white border border-[#DDDDDD] text-[#222222] text-xs font-bold px-3 py-2 rounded-xl transition-all shadow-2xs"
                            >
                              <Star className="w-3.5 h-3.5 fill-current" />
                              <span>Write Review</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 border border-[#DDDDDD] shadow-2xl relative">
            <button
              onClick={() => setReviewModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-full text-[#717171] hover:bg-[#F7F7F7]"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold text-[#FF385C] uppercase tracking-wider">
                Product Review &amp; Customer Feedback
              </span>
              <h2 className="text-lg font-black text-[#222222] mt-0.5">
                {selectedProduct.product_name || "Hardware Item"}
              </h2>
              <p className="text-xs text-[#717171]">
                Share your experience to help Texas shoppers evaluate this product.
              </p>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block text-[#222222] font-bold mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 focus:outline-none transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-7 h-7 ${
                          star <= rating
                            ? "fill-[#FF385C] text-[#FF385C]"
                            : "text-[#DDDDDD] fill-[#DDDDDD]"
                        }`}
                      />
                    </button>
                  ))}
                  <span className="ml-2 font-bold text-xs text-[#222222]">{rating} Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-[#222222] font-bold mb-1">Your Review</label>
                <textarea
                  rows={4}
                  required
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Tell us about the product quality, performance, or Texas delivery speed..."
                  className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222] focus:outline-none focus:border-[#222222]"
                />
              </div>

              {reviewMessage.text && (
                <div
                  className={`p-3 rounded-xl text-xs font-bold ${
                    reviewMessage.type === "error"
                      ? "bg-red-50 border border-red-200 text-red-800"
                      : "bg-emerald-50 border border-emerald-200 text-emerald-800"
                  }`}
                >
                  {reviewMessage.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full py-3 bg-[#FF385C] hover:bg-[#E00B41] disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2 text-xs"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submittingReview ? "Submitting..." : "Submit Review"}</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
