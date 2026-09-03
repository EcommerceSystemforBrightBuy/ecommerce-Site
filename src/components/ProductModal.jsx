"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Star,
  Truck,
  Store,
  Warehouse,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Minus,
  Plus,
  ShoppingBag,
  MapPin,
  Clock,
} from "lucide-react";
import { TEXAS_CITIES, STORE_PICKUP_LOCATIONS, calculateDeliveryEstimate } from "@/data/mockData";

export default function ProductModal({
  product,
  initialVariantIndex = 0,
  isOpen,
  onClose,
  selectedCity,
  onAddToCart,
}) {
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(initialVariantIndex);
  const [quantity, setQuantity] = useState(1);
  const [deliveryCity, setDeliveryCity] = useState(selectedCity.name);

  useEffect(() => {
    setSelectedVariantIndex(initialVariantIndex || 0);
    setQuantity(1);
  }, [initialVariantIndex, product]);

  useEffect(() => {
    setDeliveryCity(selectedCity.name);
  }, [selectedCity]);

  if (!isOpen || !product) return null;

  const currentVariant = product.variants[selectedVariantIndex] || product.variants[0];
  const isInStock = currentVariant.stock > 0;
  const estimate = calculateDeliveryEstimate(deliveryCity, isInStock);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 overflow-y-auto flex flex-col md:flex-row relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 hover:bg-slate-100 text-slate-500 hover:text-slate-900 shadow-sm border border-slate-200 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Product Image Section */}
        <div className="md:w-1/2 bg-slate-50 p-6 sm:p-8 flex flex-col justify-center items-center relative border-b md:border-b-0 md:border-r border-slate-200">
          <div className="relative w-full aspect-square max-w-sm rounded-2xl overflow-hidden shadow-md bg-white">
            <img
              src={product.image}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            {product.badge && (
              <span className="absolute top-3 left-3 px-3 py-1 text-xs font-bold uppercase tracking-wider bg-slate-900/90 text-white rounded-md shadow-xs">
                {product.badge}
              </span>
            )}
          </div>

          {/* Warehouse SKU verification badge */}
          <div className="mt-6 w-full max-w-sm p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <Warehouse className="w-4 h-4 text-blue-600" />
              <span className="text-slate-600">Central Texas Warehouse SKU:</span>
            </div>
            <span className="font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
              {currentVariant.sku}
            </span>
          </div>
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                {product.brand}
              </span>
              <div className="flex items-center gap-1 text-xs text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-slate-900">{product.rating}</span>
                <span className="text-slate-600">({product.reviewCount} reviews)</span>
              </div>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1.5">
              {product.name}
            </h2>

            <p className="text-sm text-slate-600 mt-2.5 leading-relaxed">
              {product.description}
            </p>

            {/* Variant Selector */}
            <div className="mt-5 pt-4 border-t border-slate-200">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                Select Variant (Determines Price & Stock)
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {product.variants.map((variant, idx) => {
                  const isSelected = idx === selectedVariantIndex;
                  const hasStock = variant.stock > 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedVariantIndex(idx)}
                      className={`p-2.5 rounded-xl text-left border transition-all flex items-center justify-between ${
                        isSelected
                          ? "border-blue-600 bg-blue-50/70 ring-2 ring-blue-600/20"
                          : "border-slate-200 hover:border-slate-300 bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {variant.colorHex && (
                          <span
                            className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-2xs"
                            style={{ backgroundColor: variant.colorHex }}
                          />
                        )}
                        <div>
                          <div className="text-xs font-bold text-slate-900">
                            {variant.name}
                          </div>
                          <div className="text-[11px] text-slate-600 font-mono">
                            ${variant.price.toFixed(2)}
                          </div>
                        </div>
                      </div>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          hasStock
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {hasStock ? `${variant.stock} in stock` : "Backorder"}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Texas Delivery Calculator Box */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                  <Truck className="w-4 h-4 text-blue-600" />
                  <span>Texas Delivery Time Calculator</span>
                </div>
                {/* Destination City Picker */}
                <select
                  value={deliveryCity}
                  onChange={(e) => setDeliveryCity(e.target.value)}
                  className="text-xs font-semibold bg-white border border-slate-300 rounded-lg px-2 py-1 text-slate-800 focus:ring-1 focus:ring-blue-600"
                >
                  {TEXAS_CITIES.map((c) => (
                    <option key={c.name} value={c.name}>
                      {c.name}, TX {c.isMain ? "(Main City)" : "(Regional)"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Delivery Calculation Breakdown */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between text-slate-600">
                  <span>Transit Mode: Standard Texas Ground</span>
                  <span className="font-semibold text-slate-900">
                    {estimate.baseDays} Business Days ({estimate.isMain ? "Main Metro" : "Regional City"})
                  </span>
                </div>

                {estimate.stockDelayAdded && (
                  <div className="flex items-center justify-between text-amber-700 bg-amber-100/60 px-2 py-1 rounded-md text-[11px] font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      Item Out of Stock at Central Warehouse
                    </span>
                    <span className="font-bold">+3 Days buffer added</span>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-slate-900 font-bold">
                  <span>Estimated Arrival:</span>
                  <span className="text-blue-600">
                    {estimate.estimatedDate} ({estimate.days} Days Total)
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing, Quantity & Add to Cart Footer */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs text-slate-600 font-medium">Total Price</div>
              <div className="text-2xl font-black text-slate-900">
                ${(currentVariant.price * quantity).toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Quantity Stepper */}
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 p-1">
                <button
                  type="button"
                  disabled={quantity <= 1}
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-3 text-xs font-bold text-slate-900">{quantity}</span>
                <button
                  type="button"
                  disabled={quantity >= (currentVariant.stock || 10)}
                  onClick={() => setQuantity((q) => q + 1)}
                  className="p-1.5 rounded-lg hover:bg-white text-slate-600 disabled:opacity-30"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                onClick={() => {
                  onAddToCart(product, currentVariant, quantity);
                  onClose();
                }}
                className={`px-5 py-3 rounded-xl text-xs font-bold text-white shadow-lg flex items-center gap-2 transition-all active:scale-95 ${
                  isInStock
                    ? "bg-blue-600 hover:bg-blue-700 shadow-blue-500/25"
                    : "bg-amber-600 hover:bg-amber-700 shadow-amber-500/25"
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isInStock ? "Add to Cart" : "Order on Backorder"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
