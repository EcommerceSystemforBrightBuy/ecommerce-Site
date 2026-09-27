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

  useEffect(() => {
     fetch(`http://localhost:8000/api/products/${unwrappedParams.id}`)
       .then(response => response.json())
       .then(data => {
         setproduct(data),
         setloading(false)
     })
  },[unwrappedParams.id]); //it will make the page refresh once the id changed

 if(loading){
    return <p>Loading products....</p>
 }

 if(!product){
    return <p>Product not Found...!</p>
 }

  const activeVariant = product.variants[variantIndex] || product.variants[0];
  const isInStock = activeVariant.stock > 0;
  const estimate = calculateDeliveryEstimate(selectedCity.name, isInStock);


  const handleAddToCart = () => {
    addToCart(product, activeVariant, quantity);
    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2500);
  };

  const handleBuyNow = () => {
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
          {product.rating && (
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-[#222222] text-[#222222]" />
            <span>{product.rating}</span>
            <span className="text-[#717171] font-normal">({product.reviewCount} reviews)</span>
          </div>
        )}
          <span>•</span>
          <span>Brand: {product.brand}</span>
          <span>•</span>
          <span className="text-[#717171] font-mono">Central WH SKU: {activeVariant.sku}</span>
        </div>
      </div>

      {/* Large Airbnb Image Gallery Container */}
      <div className="rounded-3xl overflow-hidden aspect-16/9 max-h-[460px] bg-[#F7F7F7] border border-[#EBEBEB] relative">
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-full object-cover"
        />
        {product.badge && (
          <span className="absolute top-4 left-4 px-3 py-1 bg-white/90 text-[#222222] font-bold text-xs rounded-full shadow-sm">
            {product.badge}
          </span>
        )}
      </div>

      {/* 2-Column Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 pt-4 items-start">
        {/* Left Column: Specs & Texas Logistics Details */}
        <div className="lg:col-span-7 space-y-8">
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
              <span className="text-[#717171] font-normal">{activeVariant.name}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {product.variants.map((variant, idx) => {
                const isSelected = idx === variantIndex;
                const vStock = variant.stock > 0;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setVariantIndex(idx)}
                    className={`p-4 rounded-2xl text-left border transition-all flex items-center justify-between ${
                      isSelected
                        ? "border-[#222222] bg-[#F7F7F7] ring-1 ring-[#222222]"
                        : "border-[#DDDDDD] bg-white hover:border-[#222222]"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-xs text-[#222222]">{variant.name}</div>
                      <div className="text-[11px] font-mono text-[#717171]">
                        ${variant.price.toFixed(2)} • {variant.sku}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                        vStock ? "bg-emerald-100 text-emerald-900" : "bg-amber-100 text-amber-900"
                      }`}
                    >
                      {vStock ? `${variant.stock} in stock` : "Backorder"}
                    </span>
                  </button>
                );
              })}
            </div>
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

        {/* Right Column: Airbnb Sticky Reservation / Booking Card */}
        <div className="lg:col-span-5 sticky top-28">
          <div className="border border-[#DDDDDD] rounded-3xl p-6 shadow-xl bg-white space-y-6">
            {/* Pricing Header */}
            <div className="flex items-baseline justify-between border-b border-[#EBEBEB] pb-4">
              <div>
                <span className="text-3xl font-black text-[#222222]">
                  ${activeVariant.price.toFixed(2)}
                </span>
                <span className="text-xs text-[#717171] ml-1">/ unit</span>
              </div>
              <div className="flex items-center gap-1 text-xs font-bold text-[#222222]">
                <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                <span>{product.rating}</span>
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
                  disabled={quantity >= (activeVariant.stock || 10)}
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
