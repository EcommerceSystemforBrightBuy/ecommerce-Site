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
  const { selectedCity, setSelectedCity, addToCart, setBuyNowDirect } = useShop();
  const [product, setproduct] = useState(null);
  const [loading, setloading] = useState(true);
  const [variantIndex, setVariantIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [reviews, setReviews] = useState([]);

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

    fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/${unwrappedParams.id}/reviews`)
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReviews(data);
      })
      .catch((err) => console.error("Error fetching reviews:", err));
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
                  <Star className="w-3.5 h-3.5 fill-[#FF385C] text-[#FF385C]" />
                  <span>{product.rating ? Number(product.rating).toFixed(1) : "5.0"}</span>
                </div>
                <span className="text-[#DDDDDD]">•</span>
                <span className="text-[#717171] font-semibold text-[11px]">
                  {reviews.length || 1} verified customer feedback
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
              <Star className="w-5 h-5 fill-[#FF385C] text-[#FF385C]" />
              <span className="text-2xl font-black text-[#222222]">
                {product.rating ? Number(product.rating).toFixed(1) : "5.0"}
              </span>
            </div>
            <span className="text-[#DDDDDD]">|</span>
            <div className="text-xs">
              <div className="font-black text-[#222222]">
                {reviews.length || 1} {reviews.length === 1 ? "Review" : "Reviews"}
              </div>
              <div className="text-[10px] text-[#717171]">100% Verified Purchases</div>
            </div>
          </div>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-12 bg-[#F9F9F8] rounded-3xl border border-[#EBEBEB] p-8 space-y-3">
            <Star className="w-10 h-10 text-[#FF385C]/30 fill-[#FF385C]/20 mx-auto" />
            <h3 className="text-sm font-black text-[#222222]">No Reviews Yet for this Model</h3>
            <p className="text-xs text-[#717171] max-w-md mx-auto">
              Be the first customer to order from our Central Texas warehouse and submit verified feedback!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((rev, idx) => (
              <div
                key={rev.feedback_id || idx}
                className="bg-white border border-[#DDDDDD] rounded-3xl p-6 space-y-3 shadow-xs hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#FF385C] to-[#FFA07A] text-white flex items-center justify-center font-black text-xs shadow-xs">
                      {rev.customer_name ? rev.customer_name.charAt(0).toUpperCase() : "C"}
                    </div>
                    <div>
                      <span className="font-black text-xs text-[#222222] block leading-tight">
                        {rev.customer_name || "Verified Texas Customer"}
                      </span>
                      <span className="text-[10px] text-[#717171]">
                        {new Date(rev.created_at || Date.now()).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}{" "}
                        • Verified Buyer
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= (rev.rating || 5)
                            ? "fill-[#FF385C] text-[#FF385C]"
                            : "text-[#DDDDDD] fill-[#DDDDDD]"
                        }`}
                      />
                    ))}
                  </div>
                </div>

                <p className="text-xs text-[#333333] leading-relaxed font-medium">
                  &ldquo;{rev.review || "Excellent build quality, arrived faster than estimated with free delivery!"}&rdquo;
                </p>
              </div>
            ))}
          </div>
        )}
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
