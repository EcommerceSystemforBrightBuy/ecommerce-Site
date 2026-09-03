"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import CategoryRibbon from "@/components/CategoryRibbon";
import { PRODUCTS } from "@/data/mockData";
import { useShop } from "@/context/ShopContext";
import { Star, Heart, ArrowRight } from "lucide-react";

export default function HomePage() {
  const { selectedCity } = useShop();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState({});

  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const filteredProducts = useMemo(() => {
    if (selectedCategory === "all") return PRODUCTS;
    return PRODUCTS.filter((p) => p.categories.includes(selectedCategory));
  }, [selectedCategory]);

  return (
    <main className="min-h-screen bg-white pb-16">
      {/* Category Ribbon */}
      <CategoryRibbon
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-8">
        {/* Subtle Airbnb Hero Note */}
        <div className="bg-[#F7F7F7] border border-[#EBEBEB] rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[#FF385C]">
              Texas Digital Commerce
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#222222] tracking-tight">
              Electronics &amp; STEM Toys from Central Texas Warehouse
            </h1>
            <p className="text-xs sm:text-sm text-[#717171] max-w-xl">
              Stock keeping verified for {selectedCity.name}, Texas. 5-day delivery to main metro
              cities, 7 days to regional Texas, or 24-hour pickup at physical store hubs.
            </p>
          </div>
          <Link
            href="/products"
            className="bg-[#222222] hover:bg-black text-white text-xs font-bold px-6 py-3.5 rounded-full transition-colors shrink-0 flex items-center gap-2"
          >
            <span>Search Full Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Product Cards Grid (Airbnb Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-2">
          {filteredProducts.map((product) => {
            const defaultVariant = product.variants[0];
            const isFav = favorites[product.id];
            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="group flex flex-col space-y-3 cursor-pointer"
              >
                {/* Airbnb Image Box */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F7F7F7] border border-[#EBEBEB]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  />
                  
                  {/* Heart Wishlist Overlay */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(product.id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full text-white/90 hover:scale-110 transition-transform"
                    aria-label="Save to wishlist"
                  >
                    <Heart
                      className={`w-6 h-6 stroke-2 ${
                        isFav ? "fill-[#FF385C] text-[#FF385C]" : "fill-black/30 text-white"
                      }`}
                    />
                  </button>

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold bg-white/90 text-[#222222] rounded-full shadow-sm backdrop-blur-xs">
                      {product.badge}
                    </span>
                  )}
                </div>

                {/* Info Text */}
                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#222222]">
                    <span className="truncate pr-2 text-sm">{product.name}</span>
                    <div className="flex items-center gap-1 shrink-0 text-xs">
                      <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <p className="text-[#717171] text-xs">
                    {product.brand} • SKU: {defaultVariant.sku}
                  </p>

                  <p className="text-[#717171] text-xs">
                    Delivering to {selectedCity.name}, TX
                  </p>

                  <div className="pt-1 flex items-baseline gap-1 text-sm font-extrabold text-[#222222]">
                    <span>${defaultVariant.price.toFixed(2)}</span>
                    <span className="text-xs font-normal text-[#717171]">total</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </main>
  );
}
