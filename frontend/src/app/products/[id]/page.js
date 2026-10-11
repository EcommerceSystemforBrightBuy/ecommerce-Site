"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { calculateDeliveryEstimate, TEXAS_CITIES } from "../../../data/mockData";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import {
  Star,
  Share2,
  Heart,
  Truck,
  Store,
  Warehouse,
  ShieldCheck,
  Plus,
  Minus,
  Check,
  ShoppingBag,
  CreditCard,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  ListFilter,
  Package,
  RotateCcw,
  Zap,
  CheckCircle2,
  MapPin,
  Sparkles,
  Info,
} from "lucide-react";

export default function ProductDetailPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const { selectedCity, setSelectedCity, addToCart, setBuyNowDirect, currentUser, authReady } = useShop();
  const [product, setproduct] = useState(null);
  const [loading, setloading] = useState(true);
  const [variantIndex, setVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [showAllReviews, setShowAllReviews] = useState(false);
  const REVIEWS_PREVIEW = 3; // Number of reviews to show in preview mode

  const [sortBy, setSortBy] = useState("newest");
  const [starFilter, setStarFilter] = useState("all");

  const filteredReviews = reviews
    .filter((r) => starFilter === "all" || Number(r.rating) === Number(starFilter))
    .sort((a, b) => {
      const byDate = new Date(b.created_at) - new Date(a.created_at);
      if (sortBy === "highest") return Number(b.rating) - Number(a.rating) || byDate;
      if (sortBy === "lowest") return Number(a.rating) - Number(b.rating) || byDate;
      return byDate;
    });

  const visibleReviews = showAllReviews
    ? filteredReviews
    : filteredReviews.slice(0, REVIEWS_PREVIEW); // Show only the limited number of reviews in preview mode

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/${unwrappedParams.id}`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }
        return response.json();
      })
      .then((data) => {
        setproduct(data);
        setloading(false);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
        setloading(false);
      });
  }, [unwrappedParams.id]);

  const [myRating, setMyRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [myReview, setMyReview] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState({ type: "", text: "" });

  const fetchReviews = () =>
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/${unwrappedParams.id}/reviews`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch product reviews");
        }
        return response.json();
      })
      .then((data) => {
        setReviews(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error fetching product reviews", err);
      });

  useEffect(() => {
    fetchReviews();
  }, [unwrappedParams.id]);

  if (loading) {
    return (
      <div role="status" className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="h-12 w-12 animate-spin rounded-full border-3 border-[#FF385C]/20 border-t-[#FF385C]" />
        <span className="text-xs font-bold text-[#717171] animate-pulse">Loading Texas Hardware Unit...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto my-20 p-8 text-center bg-[#F7F7F7] rounded-3xl border border-[#DDDDDD] space-y-4">
        <Package className="w-12 h-12 text-[#717171] mx-auto" />
        <h2 className="text-lg font-bold text-[#222222]">Product Not Found</h2>
        <p className="text-xs text-[#717171]">The product you requested might have been removed or is temporarily unavailable.</p>
        <Link
          href="/products"
          className="inline-block px-5 py-2.5 rounded-full bg-[#222222] text-white text-xs font-bold hover:bg-black transition-colors"
        >
          Return to All Products
        </Link>
      </div>
    );
  }

  const activeVariant = product.variants ? product.variants[variantIndex] || product.variants[0] : null;
  const stockCount = Number(activeVariant?.stock ?? 0);
  const isInStock = stockCount >= quantity;
  const estimate = calculateDeliveryEstimate(selectedCity.name, isInStock);

  // The API returns customer_name as "First L."
  const getReviewerName = (r) => r.customer_name || "Customer";
  const getReviewerInitial = (r) => r.customer_name?.trim()?.[0]?.toUpperCase() ?? "C";

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => Number(r.rating) === star).length,
  }));
  const RATING_LABELS = ["", "Poor", "Fair", "Good", "Very good", "Excellent"];
  // One star style everywhere: brand pink when filled, soft grey when empty
  const renderStars = (value, sizeClass = "w-3.5 h-3.5") =>
    [1, 2, 3, 4, 5].map((n) => (
      <Star
        key={n}
        className={`${sizeClass} ${
          n <= value ? "fill-[#FAC225] text-[#FAC225]" : "fill-[#E5E5E5] text-[#E5E5E5]"
        }`}
      />
    ));
  const reviewAverage = reviews.length
    ? reviews.reduce((total, review) => total + Number(review.rating || 0), 0) / reviews.length
    : null;

  const handleAddToCart = () => {
    if (!activeVariant) return;
    addToCart(product, activeVariant, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 3000);
  };

  const handleBuyNow = () => {
    if (!activeVariant) return;
    setBuyNowDirect(product, activeVariant, quantity);
    router.push("/checkout");
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2200);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setReviewMsg({ type: "", text: "" });

    const customerId = currentUser?.customerId ?? currentUser?.customer_id;
    if (!customerId) {
      setReviewMsg({ type: "error", text: "Your account is missing a customer ID. Please sign in with a registered customer account." });
      return;
    }

    if (myRating === 0) {
      setReviewMsg({ type: "error", text: "Please select a star rating" });
      return;
    }

    setSubmittingReview(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: unwrappedParams.id,
          customerId,
          rating: myRating,
          review: myReview,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to submit review");
      }

      setReviewMsg({ type: "success", text: "Thanks! Your review was added." });
      setMyRating(0);
      setMyReview("");
      await fetchReviews();

      const p = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/${unwrappedParams.id}`);
      if (p.ok) setproduct(await p.json());
    } catch (err) {
      setReviewMsg({ type: "error", text: err.message });
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8 animate-fade-in">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-[#717171]">
        <Link href="/" className="hover:text-[#222222] transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#DDDDDD]" />
        <Link href="/products" className="hover:text-[#222222] transition-colors">Products</Link>
        <ChevronRight className="w-3.5 h-3.5 text-[#DDDDDD]" />
        <span className="text-[#222222] truncate max-w-[240px] sm:max-w-md">{product.name}</span>
      </nav>

      {/* Main Side-by-Side Product Showcase (One side is Image, other side is Buy Now Box) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* ================= LEFT SIDE: Image Gallery & Texas Logistics Details (7 cols) ================= */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Product Image Container */}
          <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-[#FAF8F5] via-[#F4EFEA] to-[#EAE4DC] border border-[#E5DDD5] aspect-square sm:aspect-[4/3] flex items-center justify-center group shadow-md">
            {/* Soft Ambient Blurred Glow */}
            <img
              src={product.image_url}
              alt=""
              aria-hidden="true"
              className="absolute inset-0 w-full h-full object-cover filter blur-3xl opacity-25 scale-125 pointer-events-none"
            />

            {/* Main Interactive Product Image */}
            <img
              src={product.image_url}
              alt={product.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/placeholder.png";
              }}
              className="relative z-10 max-h-full max-w-full object-contain p-6 sm:p-10 transition-transform duration-700 ease-out group-hover:scale-108 drop-shadow-md"
            />

            {/* Badges on Image */}
            <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
              {product.badge && (
                <span className="px-3.5 py-1.5 bg-white/95 backdrop-blur-md text-[#222222] font-black text-xs rounded-full shadow-md border border-[#EBEBEB] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#FF385C]" />
                  {product.badge}
                </span>
              )}
              <span className="px-3 py-1 bg-neutral-900/90 backdrop-blur-md text-white font-extrabold text-[11px] rounded-full shadow-md flex items-center gap-1.5">
                <Warehouse className="w-3 h-3 text-[#FF385C]" />
                Austin Central Hub
              </span>
            </div>

            {/* Action Buttons Floating on Image (Share & Wishlist) */}
            <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
              <button
                type="button"
                onClick={handleShare}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#DDDDDD] hover:border-[#222222] text-[#222222] flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
                title="Share product link"
              >
                <Share2 className="w-4 h-4 text-[#555555]" />
              </button>

              <button
                type="button"
                onClick={() => setIsSaved(!isSaved)}
                className="w-10 h-10 rounded-full bg-white/90 backdrop-blur-md border border-[#DDDDDD] hover:border-[#222222] text-[#222222] flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 cursor-pointer"
                title="Save to Wishlist"
              >
                <Heart className={`w-4 h-4 transition-transform ${isSaved ? "fill-[#FF385C] text-[#FF385C] scale-110" : "text-[#555555]"}`} />
              </button>
            </div>

            {copiedLink && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 bg-neutral-900 text-white text-xs font-bold px-4 py-2 rounded-full shadow-xl animate-fade-in flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Product link copied to clipboard!</span>
              </div>
            )}
          </div>

          {/* About this Hardware Unit */}
          <div className="border border-[#EBEBEB] rounded-3xl p-6 bg-white space-y-3 shadow-2xs">
            <h2 className="text-base font-black text-[#222222] flex items-center gap-2">
              <Package className="w-4 h-4 text-[#FF385C]" />
              <span>Hardware Specifications &amp; Overview</span>
            </h2>
            <p className="text-xs sm:text-sm text-[#555555] leading-relaxed">
              {product.description || "Authentic high-grade consumer electronics certified for Texas dispatch. Precision tested and packaged at our Central Texas Distribution Hub in Austin."}
            </p>
          </div>

          {/* Texas Logistics Fulfillment Pipeline */}
          <div className="border border-[#EBEBEB] rounded-3xl p-6 bg-[#FCFBF9] space-y-4 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#EBEBEB] pb-3.5">
              <div>
                <span className="text-[10px] font-extrabold text-[#FF385C] uppercase tracking-wider">
                  Live Dispatch Status
                </span>
                <h3 className="text-sm font-black text-[#222222]">Texas Ground Fulfillment Pipeline</h3>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                <Truck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Statewide Shipping: $0.00 FREE</span>
              </div>
            </div>

            {/* 4-Step Pipeline Visual */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
              <div className="bg-white p-3 rounded-2xl border border-[#EBEBEB] space-y-1 shadow-2xs">
                <div className="w-6 h-6 mx-auto rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <div className="text-[11px] font-bold text-[#222222]">Order Verified</div>
                <div className="text-[10px] text-[#717171]">Instant Sandbox Sync</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#EBEBEB] space-y-1 shadow-2xs">
                <div className="w-6 h-6 mx-auto rounded-full bg-blue-100 text-blue-800 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <div className="text-[11px] font-bold text-[#222222]">Austin WH Pick</div>
                <div className="text-[10px] text-[#717171]">Central Warehouse</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#EBEBEB] space-y-1 shadow-2xs">
                <div className="w-6 h-6 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <div className="text-[11px] font-bold text-[#222222]">{selectedCity.name} Hub</div>
                <div className="text-[10px] text-[#717171]">Regional Sort</div>
              </div>

              <div className="bg-white p-3 rounded-2xl border border-[#EBEBEB] space-y-1 shadow-2xs">
                <div className="w-6 h-6 mx-auto rounded-full bg-purple-100 text-purple-800 flex items-center justify-center font-bold text-xs">
                  4
                </div>
                <div className="text-[11px] font-bold text-[#222222]">Doorstep Drop</div>
                <div className="text-[10px] text-[#717171]">{estimate.estimatedDate}</div>
              </div>
            </div>

            {/* Quick Guarantees */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
              <div className="p-3 rounded-2xl bg-white border border-[#EBEBEB] flex items-start gap-2.5">
                <Store className="w-4 h-4 text-[#FF385C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#222222] block text-[11px]">24h Local Hub Pickup</strong>
                  <span className="text-[#717171] text-[10px]">
                    Available at Austin, Dallas, Houston, and San Antonio depots.
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-[#EBEBEB] flex items-start gap-2.5">
                <RotateCcw className="w-4 h-4 text-[#FF385C] shrink-0 mt-0.5" />
                <div>
                  <strong className="text-[#222222] block text-[11px]">30-Day Hassle-Free Returns</strong>
                  <span className="text-[#717171] text-[10px]">
                    Free prepaid return label included in every package.
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SIDE: BUY NOW & PURCHASE BOX (5 cols) ================= */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <div className="border border-[#DDDDDD] rounded-3xl p-6 sm:p-7 shadow-xl bg-white space-y-5 relative overflow-hidden transition-all duration-300">
            {/* Top vibrant accent gradient bar */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF385C] via-[#FF5A5F] to-[#E00B41]" />

            {/* Product Title Header & Brand */}
            <div className="space-y-1.5 border-b border-[#EBEBEB] pb-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF385C] bg-[#FFF0F3] px-2.5 py-0.5 rounded-full">
                  {product.brand || "BrightBuy Certified"}
                </span>
                <span className="text-[11px] font-mono text-[#717171]">
                  SKU: <strong className="text-[#222222]">{activeVariant?.sku ?? "-"}</strong>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-[#222222] tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Verified Rating Pill */}
              <div className="flex items-center gap-2 pt-1 text-xs">
                <div className="flex items-center gap-1 font-black text-[#222222]">
                  <Star className="w-3.5 h-3.5 fill-[#FAC225] text-[#FAC225]" />
                  <span>{reviewAverage !== null ? reviewAverage.toFixed(1) : "No rating"}</span>
                </div>
                <span className="text-[#DDDDDD]">•</span>
                <span className="text-[#717171] font-semibold text-[11px]">
                  {reviews.length ? `${reviews.length} verified customer ${reviews.length === 1 ? "review" : "reviews"}` : "No reviews yet"}
                </span>
              </div>
            </div>

            {/* Live Pricing & Delivery Banner */}
            <div className="flex items-baseline justify-between">
              <div>
                <div className="text-3xl sm:text-4xl font-black text-[#222222] tracking-tight">
                  ${activeVariant?.price?.toFixed(2) ?? "-"}
                </div>
                <div className="text-[11px] text-[#717171] mt-0.5 flex items-center gap-1.5">
                  <span className="font-bold text-emerald-700">✓ Free Statewide Delivery</span>
                  <span>•</span>
                  <span>Sales tax at checkout</span>
                </div>
              </div>

              {stockCount > 0 ? (
                <div className="text-right">
                  <span className="text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 inline-flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    In Stock ({stockCount})
                  </span>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-[11px] font-black text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                    Backorder Buffer (+3d)
                  </span>
                </div>
              )}
            </div>

            {/* Select Variant / Configuration */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs font-bold text-[#222222]">
                <span className="text-xs font-black">Choose Configuration</span>
                <span className="text-[#FF385C] font-semibold text-[11px]">
                  {activeVariant?.variant_name}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {product.variants?.map((variant, idx) => {
                  const isSelected = idx === variantIndex;
                  const vStock = Number(variant?.stock ?? 0);

                  return (
                    <button
                      key={variant.variant_id || idx}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => setVariantIndex(idx)}
                      className={`p-3 rounded-2xl text-left border transition-all duration-200 cursor-pointer relative ${
                        isSelected
                          ? "border-[#222222] bg-[#FAF8F6] ring-2 ring-[#222222] shadow-sm -translate-y-0.5"
                          : "border-[#DDDDDD] bg-white hover:border-[#999999] hover:bg-[#FAF8F6]"
                      }`}
                    >
                      {isSelected && (
                        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#222222] text-white flex items-center justify-center">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </span>
                      )}

                      <div className="space-y-0.5 pr-4">
                        <div className="font-black text-xs text-[#222222] truncate">
                          {variant.variant_name}
                        </div>
                        <div className="text-xs font-black text-[#222222]">
                          ${variant?.price?.toFixed(2) ?? "-"}
                        </div>
                      </div>

                      <div className="mt-1.5 pt-1.5 border-t border-[#EBEBEB] text-[10px] flex items-center justify-between">
                        <span className={`font-bold ${vStock > 0 ? "text-emerald-700" : "text-amber-700"}`}>
                          {vStock > 0 ? "In Stock" : "Backorder"}
                        </span>
                        <span className="text-[#717171] font-mono text-[9px]">{variant?.sku}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Texas Destination & Live Delivery Estimate Box */}
            <div className="border border-[#DDDDDD] rounded-2xl p-4 space-y-2.5 bg-[#FAF9F7] text-xs">
              <div className="flex items-center justify-between gap-2">
                <span className="font-black text-[#222222] flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#FF385C]" />
                  Texas Delivery Hub
                </span>
                <select
                  value={selectedCity.name}
                  onChange={(e) => {
                    const c = TEXAS_CITIES.find((item) => item.name === e.target.value);
                    if (c) setSelectedCity(c);
                  }}
                  className="bg-white border border-[#DDDDDD] rounded-xl px-2.5 py-1 text-xs font-bold text-[#222222] shadow-2xs hover:border-[#222222] focus:outline-none cursor-pointer"
                >
                  {TEXAS_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, TX {c.isMain ? "(Metro Hub)" : "(Regional)"}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1 text-[11px] text-[#555555] pt-0.5">
                <div className="flex justify-between items-center">
                  <span>Transit Speed</span>
                  <span className="font-bold text-[#222222]">
                    {estimate.baseDays} Business Days
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Delivery Charge</span>
                  <span className="font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                    FREE ($0.00)
                  </span>
                </div>

                <div className="pt-2 border-t border-[#EBEBEB] flex justify-between items-center text-xs font-bold text-[#222222]">
                  <span>Estimated Arrival:</span>
                  <span className="text-[#FF385C] font-black">{estimate.estimatedDate}</span>
                </div>
              </div>
            </div>

            {/* Quantity Stepper */}
            <div className="flex items-center justify-between border-y border-[#EBEBEB] py-3">
              <div>
                <span className="font-bold text-xs text-[#222222] block">Select Quantity</span>
                <span className="text-[10px] text-[#717171]">
                  {stockCount > 0 ? `${stockCount} available` : "Backorder reserve"}
                </span>
              </div>

              <div className="flex items-center border border-[#DDDDDD] rounded-full p-1 bg-[#F7F7F7]">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 rounded-full bg-white text-[#222222] flex items-center justify-center disabled:opacity-30 shadow-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3.5 font-black text-xs text-[#222222] font-mono">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= 99}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 rounded-full bg-white text-[#222222] flex items-center justify-center disabled:opacity-30 shadow-xs font-bold hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Dual Action Buttons (Add to Shopping Bag + Buy Now with 1-Click) */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E00B41] active:scale-[0.98] text-white text-xs font-black rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                {addedNotice ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-bounce" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Add to Shopping Bag</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                className="w-full py-3.5 bg-[#222222] hover:bg-black active:scale-[0.98] text-white text-xs font-black rounded-2xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Buy Now with 1-Click</span>
              </button>
            </div>

            {/* Added to Cart Feedback Toast */}
            {addedNotice && (
              <div className="text-center text-xs font-bold text-[#222222] bg-[#F7F7F7] p-3 rounded-2xl border border-[#DDDDDD] space-y-1 animate-fade-in">
                <div>Unit successfully reserved in cart!</div>
                <Link
                  href="/cart"
                  className="inline-flex items-center gap-1 text-[#FF385C] hover:underline font-extrabold"
                >
                  <span>Proceed to Shopping Bag &rarr;</span>
                </Link>
              </div>
            )}

            {/* Security Guarantee Strip */}
            <div className="pt-2 border-t border-[#EBEBEB] grid grid-cols-2 gap-2 text-[10px] text-[#717171] font-medium">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>PayHere Sandbox Secured</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>30-Day Texas Warranty</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Customer Feedback & Product Reviews Section */}
      <div className="border-t border-[#EBEBEB] pt-12 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-black text-[#FF385C] uppercase tracking-wider">
              Verified Texas Buyers
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#222222] mt-0.5">
              Customer Reviews &amp; Ratings
            </h2>
          </div>

          <div className="flex items-center gap-4 bg-[#FBFBFA] border border-[#DDDDDD] px-5 py-3 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2">
              <Star className="w-5 h-5 fill-[#FAC225] text-[#FAC225]" />
              <span className="text-2xl font-black text-[#222222]">
                {reviewAverage !== null ? reviewAverage.toFixed(1) : "N/A"}
              </span>
            </div>
            <span className="text-[#DDDDDD]">|</span>
            <div className="text-xs">
              <div className="font-black text-[#222222]">
                {reviews.length} {reviews.length === 1 ? "Review" : "Reviews"}
              </div>
              <div className="text-[10px] text-[#717171]">100% Verified Purchases</div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {authReady && currentUser ? (
            <form
              onSubmit={handleSubmitReview}
              className="rounded-2xl border border-[#EBEBEB] bg-white p-6 shadow-xs space-y-4"
            >
              <div>
                <h3 className="text-base font-black text-[#222222]">Write a review</h3>
                <p className="text-[11px] text-[#717171]">Tell other shoppers what you think of this product.</p>
              </div>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(0)}>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <button
                      key={n}
                      type="button"
                      aria-label={`${n} star${n > 1 ? "s" : ""}`}
                      onMouseEnter={() => setHoverRating(n)}
                      onClick={() => setMyRating(n)}
                      className="rounded-md p-0.5 transition-transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FAC225] cursor-pointer"
                    >
                      <Star
                        className={`h-8 w-8 transition-colors ${
                          n <= (hoverRating || myRating)
                            ? "fill-[#FAC225] text-[#FAC225]"
                            : "fill-[#E5E5E5] text-[#E5E5E5]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                <span className="text-xs font-bold text-[#222222]">
                  {RATING_LABELS[hoverRating || myRating] || "Select a rating"}
                </span>
              </div>

              <div>
                <textarea
                  rows={3}
                  maxLength={500}
                  value={myReview}
                  onChange={(e) => setMyReview(e.target.value)}
                  placeholder="Share your experience (optional)"
                  className="w-full resize-none rounded-xl border border-[#DDDDDD] bg-[#FAFAFA] p-3.5 text-xs leading-relaxed text-[#222222] placeholder:text-[#999999] transition focus:border-[#222222] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FAC225]/40"
                />
                <div className="mt-1 text-right text-[11px] text-[#717171]">{myReview.length}/500</div>
              </div>

              {reviewMsg.text && (
                <div
                  role="status"
                  className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-semibold ${
                    reviewMsg.type === "error"
                      ? "border-[#FFD0D8] bg-[#FFF0F3] text-[#E00B41]"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  {reviewMsg.type === "error" ? (
                    <Info className="h-4 w-4 shrink-0" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                  )}
                  <span>{reviewMsg.text}</span>
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingReview || myRating === 0}
                  className="w-full sm:w-auto rounded-xl bg-[#FF385C] px-8 py-3 text-xs font-black text-white shadow-md transition-all hover:bg-[#E00B41] hover:shadow-lg active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none cursor-pointer"
                >
                  {submittingReview ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          ) : authReady ? (
            <div className="rounded-2xl border border-[#EBEBEB] bg-[#FBFBFA] p-5 shadow-xs flex items-center justify-between gap-4">
              <div>
                <h3 className="text-sm font-black text-[#222222]">Share your thoughts</h3>
                <p className="text-[11px] text-[#717171]">Log in to rate and review this product.</p>
              </div>
              <Link
                href={`/login?redirect=${encodeURIComponent(`/products/${unwrappedParams.id}`)}`}
                className="shrink-0 rounded-full bg-[#222222] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-black"
              >
                Log in
              </Link>
            </div>
          ) : null}

          <div className="overflow-hidden rounded-2xl border border-[#EBEBEB] bg-white shadow-xs">
            <div className="border-b border-[#EBEBEB] bg-[#FAFAFA] px-6 py-4">
              <h3 className="text-sm sm:text-base font-bold text-[#222222]">
                Ratings &amp; Reviews of {product.name}
              </h3>
            </div>

            {reviews.length === 0 ? (
              <div className="px-6 py-12 text-center space-y-3">
                <Star className="mx-auto h-10 w-10 fill-[#E5E5E5] text-[#E5E5E5]" />
                <h4 className="text-sm font-black text-[#222222]">No reviews yet for this model</h4>
                <p className="mx-auto max-w-md text-xs text-[#717171]">
                  Be the first to share your experience with this product.
                </p>
              </div>
            ) : (
              <>
                {/* Summary */}
                <div className="flex flex-col gap-8 px-6 py-7 sm:flex-row sm:items-center">
                  <div className="shrink-0">
                    <div className="flex items-baseline gap-1">
                      <span className="text-6xl font-bold leading-none text-[#222222]">
                        {reviewAverage?.toFixed(1)}
                      </span>
                      <span className="text-xl text-[#999999]">/5</span>
                    </div>
                    <div className="mt-3 flex items-center gap-0.5">
                      {renderStars(Math.round(reviewAverage ?? 0), "w-6 h-6")}
                    </div>
                    <div className="mt-2 text-xs text-[#717171]">
                      {reviews.length} {reviews.length === 1 ? "Rating" : "Ratings"}
                    </div>
                  </div>

                  <div className="w-full max-w-md flex-1 space-y-1.5">
                    {ratingCounts.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-3">
                        <div className="flex w-24 shrink-0 items-center gap-0.5">
                          {renderStars(star, "w-4 h-4")}
                        </div>
                        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#F0F0F0]">
                          <div
                            className="h-full rounded-full bg-[#FAC225] transition-all duration-500"
                            style={{ width: `${(count / reviews.length) * 100}%` }}
                          />
                        </div>
                        <span className="w-6 text-right text-xs text-[#222222]">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Toolbar */}
                <div className="flex flex-col gap-3 border-t border-[#EBEBEB] px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <h4 className="text-sm font-semibold text-[#222222]">Product Reviews</h4>
                  <div className="flex flex-wrap items-center gap-4 text-xs">
                    <label className="flex items-center gap-1.5 text-[#717171]">
                      <ArrowUpDown className="h-4 w-4" />
                      <span>Sort:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="cursor-pointer rounded-md bg-transparent py-1 font-semibold text-[#222222] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FAC225]"
                      >
                        <option value="newest">Newest</option>
                        <option value="highest">Highest rating</option>
                        <option value="lowest">Lowest rating</option>
                      </select>
                    </label>
                    <label className="flex items-center gap-1.5 text-[#717171]">
                      <ListFilter className="h-4 w-4" />
                      <span>Filter:</span>
                      <select
                        value={starFilter}
                        onChange={(e) => {
                          setStarFilter(e.target.value);
                          setShowAllReviews(false);
                        }}
                        className="cursor-pointer rounded-md bg-transparent py-1 font-semibold text-[#222222] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FAC225]"
                      >
                        <option value="all">All star</option>
                        {[5, 4, 3, 2, 1].map((n) => (
                          <option key={n} value={n}>
                            {n} star
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                </div>

                {/* Review list */}
                {filteredReviews.length === 0 ? (
                  <p className="border-t border-[#EBEBEB] px-6 py-10 text-center text-xs text-[#717171]">
                    No {starFilter}-star reviews yet.
                  </p>
                ) : (
                  <div>
                    {visibleReviews.map((rev) => (
                      <article key={rev.feedback_id} className="border-t border-[#EBEBEB] px-6 py-5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-0.5" aria-label={`${rev.rating} out of 5 stars`}>
                            {renderStars(Number(rev.rating), "w-4 h-4")}
                          </div>
                          {rev.created_at && (
                            <time className="text-[11px] text-[#717171]" dateTime={rev.created_at}>
                              {new Date(rev.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </time>
                          )}
                        </div>
                        <p className="mt-1 text-xs text-[#717171]">{getReviewerName(rev)}</p>
                        {rev.review && (
                          <p className="mt-3 text-sm leading-relaxed text-[#222222]">{rev.review}</p>
                        )}
                      </article>
                    ))}
                  </div>
                )}

                {filteredReviews.length > REVIEWS_PREVIEW && (
                  <button
                    type="button"
                    aria-expanded={showAllReviews}
                    onClick={() => setShowAllReviews((show) => !show)}
                    className="flex w-full items-center justify-center gap-1.5 border-t border-[#EBEBEB] py-3.5 text-xs font-bold text-[#222222] transition-colors hover:bg-[#F7F7F7] cursor-pointer"
                  >
                    {showAllReviews ? "Show fewer reviews" : `Show all ${filteredReviews.length} reviews`}
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showAllReviews ? "rotate-180" : ""}`}
                    />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Floating Sticky Checkout Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#EBEBEB] p-3 px-4 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] text-[#717171] uppercase font-bold">Total Unit Price</div>
          <div className="text-lg font-black text-[#222222]">
            ${activeVariant?.price?.toFixed(2) ?? "-"}
          </div>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          className="flex-1 max-w-[200px] py-3 bg-[#FF385C] active:scale-95 text-white text-xs font-black rounded-xl shadow-md flex items-center justify-center gap-1.5"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>{addedNotice ? "Added!" : "Add to Bag"}</span>
        </button>
      </div>
    </main>
  );
}