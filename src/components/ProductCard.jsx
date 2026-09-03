"use client";

import React, { useState } from "react";
import {
  Star,
  Truck,
  Check,
  Package,
  Layers,
  ShoppingBag,
  Info,
  Clock,
} from "lucide-react";
import { calculateDeliveryEstimate } from "@/data/mockData";

export default function ProductCard({
  product,
  selectedCity,
  onAddToCart,
  onOpenProductModal,
}) {
  // Active variant state (defaults to the first variant)
  const [activeVariantIndex, setActiveVariantIndex] = useState(0);
  const activeVariant = product.variants[activeVariantIndex] || product.variants[0];

  const isInStock = activeVariant.stock > 0;
  const estimate = calculateDeliveryEstimate(selectedCity.name, isInStock);

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 shadow-2xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden relative">
      {/* Product Image Container */}
      <div
        className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onOpenProductModal(product, activeVariantIndex)}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          {product.badge && (
            <span className="px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider bg-slate-900/90 text-white rounded-md backdrop-blur-md shadow-xs">
              {product.badge}
            </span>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="absolute top-3 right-3 z-10">
          {isInStock ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-emerald-500/90 text-white rounded-md backdrop-blur-md shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              In Stock ({activeVariant.stock})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-amber-600/90 text-white rounded-md backdrop-blur-md shadow-xs">
              <Clock className="w-3 h-3" />
              Restocking (+3d)
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Warehouse SKU */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-600 mb-1">
            <span className="font-semibold text-blue-600 uppercase tracking-wider text-[11px]">
              {product.brand}
            </span>
            <span
              className="font-mono text-[11px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 border border-slate-200/60 truncate max-w-[150px]"
              title={`Warehouse Central SKU: ${activeVariant.sku}`}
            >
              {activeVariant.sku}
            </span>
          </div>

          {/* Product Title */}
          <h2
            onClick={() => onOpenProductModal(product, activeVariantIndex)}
            className="font-bold text-base text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors cursor-pointer"
            title={product.name}
          >
            {product.name}
          </h2>

          {/* Ratings */}
          <div className="flex items-center gap-1.5 mt-1.5">
            <div className="flex text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-bold text-slate-800">{product.rating}</span>
            <span className="text-xs text-slate-600">({product.reviewCount})</span>
          </div>

          {/* Variant Selector Chips (if multiple variants) */}
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between text-[11px] mb-1.5 text-slate-600">
              <span className="font-medium">
                Variant: <span className="font-semibold text-slate-800">{activeVariant.name}</span>
              </span>
              {product.variants.length > 1 && (
                <span className="text-slate-600">
                  {product.variants.length} options
                </span>
              )}
            </div>

            {product.variants.length > 1 ? (
              <div className="flex flex-wrap gap-1.5">
                {product.variants.map((variant, idx) => {
                  const isSelected = idx === activeVariantIndex;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setActiveVariantIndex(idx)}
                      className={`px-2 py-1 text-[11px] rounded-md font-medium transition-all flex items-center gap-1.5 border ${
                        isSelected
                          ? "bg-blue-50 border-blue-600 text-blue-800 font-semibold ring-1 ring-blue-600"
                          : "bg-white border-slate-200 text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      {variant.colorHex && (
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0"
                          style={{ backgroundColor: variant.colorHex }}
                        />
                      )}
                      <span className="truncate max-w-[90px]">{variant.spec || variant.color}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="text-[11px] text-slate-600 italic">
                Standard default variant (Direct Central WH stock)
              </div>
            )}
          </div>
        </div>

        {/* Price & Delivery & CTA */}
        <div className="mt-4 pt-3 border-t border-slate-100 space-y-3">
          {/* Live Delivery estimate pill for selected Texas city */}
          <div
            className={`text-[11px] px-2.5 py-1.5 rounded-lg flex items-center justify-between ${
              isInStock
                ? "bg-slate-50 text-slate-700 border border-slate-200/60"
                : "bg-amber-50 text-amber-900 border border-amber-200/60"
            }`}
          >
            <div className="flex items-center gap-1.5 truncate">
              <Truck className={`w-3.5 h-3.5 shrink-0 ${isInStock ? "text-blue-600" : "text-amber-600"}`} />
              <span className="truncate">
                {selectedCity.name}:{" "}
                <span className="font-semibold">{estimate.estimatedDate}</span>
              </span>
            </div>
            <span className="font-bold text-[10px] shrink-0">
              {estimate.days} Days {estimate.stockDelayAdded && "(+3d restock)"}
            </span>
          </div>

          {/* Price & Add to Cart button */}
          <div className="flex items-center justify-between gap-2">
            <div>
              <div className="text-[11px] text-slate-600 leading-none">Price</div>
              <div className="text-xl font-extrabold text-slate-900 leading-tight">
                ${activeVariant.price.toFixed(2)}
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => onOpenProductModal(product, activeVariantIndex)}
                className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                title="View specs and warehouse details"
              >
                <Info className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onAddToCart(product, activeVariant)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                  isInStock
                    ? "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-blue-500/20"
                    : "bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-amber-500/20"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{isInStock ? "Add to Cart" : "Backorder"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
