"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import {calculateDeliveryEstimate, TEXAS_CITIES} from "../../../data/mockData"
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import {
  Star,
  Share,
  Heart,
  Truck,
  Store,
  Warehouse,
  Shield,
  Clock,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  CreditCard,
  ChevronDown,
} from "lucide-react";

export default function ProductDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { selectedCity, setSelectedCity, addToCart } = useShop();
  const [product, setproduct] = useState(null);
  const [loading, setloading] = useState(true);
  const [variantIndex, setVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const REVIEWS_PREVIEW = 3; // Number of reviews to show in preview mode
  
  const visibleReviews = showAllReviews
    ? reviews
    : reviews.slice(0, REVIEWS_PREVIEW); // Show only the limited number of reviews in preview mode

  useEffect(() => {
     fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/${unwrappedParams.id}`)
       .then(response => {
          if(!response.ok){
            throw new Error("Failed to fetch product")
          }
          return response.json();
        })
       .then(data => {
         setproduct(data);
         setloading(false);
       })
       .catch((err) => {
          console.error("Error fetching product:", err);
          setloading(false);
       })
  },[unwrappedParams.id]); //it will make the page refresh once the id changed

  useEffect(() =>{
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/${unwrappedParams.id}/review`)
    .then(response => {
      
      if(!response.ok){
        throw new Error("Failed to fetch product reviews")
      }
      return response.json()
    })
    .then(data => {
      setReviews(Array.isArray(data) ? data : [])
    })
    .catch((err) =>{
        console.error("Error fetching product reviews", err);
    })
  }, [unwrappedParams.id])

 if (loading) {
    return (
      <div role="status" className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#222222]/20 border-t-[#222222]" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

 if(!product){
    return <p>Product not Found...!</p>
 }

  const activeVariant = product.variants ? product.variants[variantIndex] || product.variants[0] : null;
  const isInStock = activeVariant?.stock > 0;
  const estimate = calculateDeliveryEstimate(selectedCity.name, isInStock);

  const getReviewerName = (r) =>
    r.first_name
      ? `${r.first_name} ${r.last_initial ? r.last_initial + "." : ""}`.trim()
      : "Customer";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Number(r.rating) === star).length,
  }));

  const handleAddToCart = () => {
    if(!activeVariant) return; // Ensure a variant is selected before adding to cart
    addToCart(product, activeVariant, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
    if(!activeVariant) return;
    addToCart(product, activeVariant, quantity);
    router.push("/checkout");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-6">
      {/* Product Title Header */}
      <div className="space-y-2 border-b border-[#EBEBEB] pb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222]">
            {product.name}
          </h1>

          <div className="flex items-center gap-4 text-xs font-semibold text-[#222222] shrink-0">
            <button
              onClick={() => setIsSaved(!isSaved)}
              className="flex items-center gap-1.5 hover:bg-[#F7F7F7] px-3 py-1.5 rounded-full transition-colors"
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-[#FF385C] text-[#FF385C]" : "text-[#717171]"}`} />
              <span className="underline">{isSaved ? "Saved" : "Save"}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 text-xs text-[#222222] font-semibold">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#222222] text-[#222222]" />
            <span>{product.rating ?? "No rating"}</span>
            <span className="text-[#717171] font-normal">({product.reviewCount ? product.reviewCount+" reviews" : "No reviews yet"})</span>
          </div>
          <span>•</span>
          <span>Brand: {product.brand}</span>
          <span>•</span>
          <span className="text-[#717171] font-mono">Central WH SKU: {activeVariant?.sku?? '-'}</span>
        </div>
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pt-4 items-start">
        {/* Left Column: Specs & Texas Logistics Details */}
        <div className="lg:col-span-7 space-y-8">
          <div className="relative aspect-[4/3] max-h-[520px] overflow-hidden rounded-3xl border border-[#EBEBEB] bg-[#F7F7F7] shadow-sm">
            <img
              src={product.image_url}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.png";
              }}
              className="h-full w-full object-cover"
            />
            {product.badge && (
              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-[#222222] shadow-sm">
                {product.badge}
              </span>
            )}
          </div>

          <div className="border-b border-[#EBEBEB] pb-6 space-y-3">
            <h2 className="text-xl font-bold text-[#222222]">
              About this hardware unit
            </h2>
            <p className="text-sm text-[#717171] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Variant Selector Chips */}
          <div className="border-b border-[#EBEBEB] pb-6 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#222222]">
              <span>Choose Variant Option</span>
              <span className="text-[#717171] font-normal">{activeVariant?.variant_name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.variants?.map((variant, idx) => {
                const isSelected = idx === variantIndex;
                const inStock = variant?.stock > 0;

                return (
                  <button
                    key={variant.variant_id}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => setVariantIndex(idx)}
                    className={`p-4 rounded-2xl text-left border transition-all ${
                      isSelected
                        ? "border-[#222222] bg-[#F7F7F7] ring-1 ring-[#222222]"
                        : "border-[#DDDDDD] bg-white hover:border-[#222222]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <div className="font-bold text-xs text-[#222222]">
                          {variant.variant_name}
                        </div>
                        <div className="text-[11px] font-mono text-[#717171]">
                          ${variant?.price?.toFixed(2) ?? "-"} • {variant?.sku ?? "-"}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 whitespace-nowrap text-[10px] font-bold px-2 py-1 rounded-full ${
                          inStock
                            ? "bg-emerald-100 text-emerald-900"
                            : "bg-amber-100 text-amber-900"
                        }`}
                      >
                        {inStock ? `${variant.stock} in stock` : "Backorder"}
                      </span>
                    </div>

                    {variant.attributes?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-2 mt-2 border-t border-[#EBEBEB]">
                        {variant.attributes.map((a, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-white border border-[#DDDDDD] text-[10px] font-semibold capitalize"
                          >
                            {a.attribute_name}: {a.attribute_value}
                          </span>
                        ))}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-lg text-[#222222]">
                  Customer Reviews{" "}
                  <span className="text-[#717171] font-normal">({reviews.length})</span>
                </h3>

                {product.rating && (
                  <div className="flex items-center gap-1.5 text-sm font-bold text-[#222222]">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{product.rating}</span>
                    <span className="text-[#717171] font-normal">
                      average · {product.reviewCount} {product.reviewCount === 1 ? "review" : "reviews"}
                    </span>
                  </div>
                )}
              </div>
              {reviews.length > 0 && (
                <div className="p-5 rounded-2xl border border-[#EBEBEB] bg-white shadow-sm flex flex-col sm:flex-row gap-6">
                  <div className="flex flex-col items-center justify-center sm:w-40 shrink-0">
                    <div className="text-4xl font-black text-[#222222]">{product.rating ?? "-"}</div>
                    <div className="flex items-center gap-0.5 mt-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <Star
                          key={n}
                          className={`w-4 h-4 ${
                            n <= Math.round(product.rating ?? 0)
                              ? "fill-yellow-400 text-yellow-400"
                              : "fill-transparent text-[#DDDDDD]"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="text-[11px] text-[#717171] mt-1">
                      {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
                    </div>
                  </div>

                  <div className="flex-1 space-y-1.5">
                    {ratingCounts.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2 text-xs">
                        <span className="w-8 font-semibold text-[#222222]">{star} ★</span>
                        <div className="flex-1 h-2 rounded-full bg-[#F0F0F0] overflow-hidden">
                          <div
                            className="h-full rounded-full bg-yellow-400"
                            style={{ width: `${(count / reviews.length) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-[#717171]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {reviews.length > 0 && (
                <div className="space-y-4">
                  {visibleReviews.map((review) => (
                    <article key={review.feedback_id} className="rounded-2xl border border-[#E5E5E5] bg-[#F7F7F7] p-4 sm:p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1.5">
                          <p className="font-bold text-sm text-[#222222]">{getReviewerName(review)}</p>
                          <div className="flex items-center gap-0.5" aria-label={`${review.rating} out of 5 stars`}>
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star key={star} className={`w-3.5 h-3.5 ${star <= Number(review.rating) ? "fill-yellow-400 text-yellow-400" : "text-[#DDDDDD]"}`} />
                            ))}
                          </div>
                        </div>
                        {review.created_at && (
                          <time className="text-xs text-[#717171] sm:pt-0.5" dateTime={review.created_at}>
                            {new Date(review.created_at).toLocaleDateString()}
                          </time>
                        )}
                      </div>
                      {review.review && <p className="mt-3 text-sm text-[#555555] leading-relaxed">{review.review}</p>}
                    </article>
                  ))}
                  {reviews.length > REVIEWS_PREVIEW && (
                    <button type="button" onClick={() => setShowAllReviews((show) => !show)} className="text-sm font-semibold underline text-[#222222]">
                      {showAllReviews ? "Show fewer reviews" : `Show all ${reviews.length} reviews`}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Texas Central Warehouse & Logistics Guarantee */}
            <div className="space-y-4 text-xs">
              <h3 className="font-bold text-[#222222] text-sm">Texas Logistics &amp; Fulfillment</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#222222]">
                    <Truck className="w-4 h-4 text-[#FF385C]" />
                    <span>Statewide Transit</span>
                  </div>
                  <p className="text-[#717171] text-[11px]">
                    5 business days for main metro cities, 7 days for regional Texas.
                  </p>
                </div>

                <div className="p-4 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] space-y-1">
                  <div className="flex items-center gap-2 font-bold text-[#222222]">
                    <Store className="w-4 h-4 text-[#FF385C]" />
                    <span>Physical Hub Pickup</span>
                  </div>
                  <p className="text-[#717171] text-[11px]">
                    Ready in 24 hours at Austin, Dallas, Houston, San Antonio, and Fort Worth.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Airbnb Sticky Reservation / Booking Card */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="border border-[#DDDDDD] rounded-3xl p-6 shadow-xl bg-white space-y-6">
            {/* Pricing Header */}
            <div className="flex items-baseline justify-between border-b border-[#EBEBEB] pb-4">
              <div>
                <span className="text-3xl font-black text-[#222222]">
                  ${activeVariant?.price?.toFixed(2) ?? '-'}
                </span>
                <span className="text-xs text-[#717171] ml-1">/ unit</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#222222]">
                <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                <span>{product.rating ?? "No rating yet"}</span>
              </div>
            </div>

            {/* Destination & Delivery Calculator Box */}
            <div className="border border-[#DDDDDD] rounded-2xl p-4 space-y-3 bg-[#F7F7F7] text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[#222222]">Texas Destination</span>
                <select
                  value={selectedCity.name}
                  onChange={(e) => {
                    const c = TEXAS_CITIES.find((item) => item.name === e.target.value);
                    if (c) setSelectedCity(c);
                  }}
                  className="bg-white border border-[#DDDDDD] rounded-lg px-2.5 py-1 text-xs font-semibold text-[#222222]"
                >
                  {TEXAS_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, TX {c.isMain ? "(Main City)" : "(Regional)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-[#717171] text-[11px]">
                <div className="flex justify-between">
                  <span>Ground Shipping</span>
                  <span className="font-semibold text-[#222222]">
                    {estimate.baseDays} Business Days
                  </span>
                </div>
                {estimate.stockDelayAdded && (
                  <div className="flex justify-between text-amber-800 font-semibold">
                    <span>Restock Buffer</span>
                    <span>+3 Days</span>
                  </div>
                )}
                <div className="pt-2 border-t border-[#DDDDDD] flex justify-between font-bold text-[#222222]">
                  <span>Estimated Arrival:</span>
                  <span className="text-[#FF385C]">{estimate.estimatedDate}</span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between text-xs border-y border-[#EBEBEB] py-3">
              <span className="font-bold text-[#222222]">Select Quantity</span>
              <div className="flex items-center border border-[#DDDDDD] rounded-full p-1 bg-[#F7F7F7]">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full bg-white text-[#222222] flex items-center justify-center disabled:opacity-30 shadow-2xs font-bold"
                >
                  -
                </button>
                <span className="px-3 font-bold text-[#222222] font-mono">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= (activeVariant?.stock || 10)}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-full bg-white text-[#222222] flex items-center justify-center disabled:opacity-30 shadow-2xs font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{addedNotice ? "Added to Cart!" : "Reserve / Add to Cart"}</span>
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-[#222222] hover:bg-black text-white text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>

            {addedNotice && (
              <div className="text-center text-xs font-bold text-[#FF385C] bg-[#F7F7F7] p-3 rounded-xl border border-[#DDDDDD]">
                Item added to cart!{" "}
                <Link href="/cart" className="underline text-[#222222]">
                  Go to Cart &rarr;
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
