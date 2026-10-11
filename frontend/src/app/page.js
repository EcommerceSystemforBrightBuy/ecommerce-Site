"use client";

import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import CategoryRibbon from "@/components/CategoryRibbon";
import HeroCarousel from "@/components/HeroCarousel";
import { useShop } from "@/context/ShopContext";
import { Star, Heart, ArrowRight, Truck, Store, ShieldCheck, CreditCard } from "lucide-react";

export default function HomePage() {
  const { selectedCity } = useShop();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [favorites, setFavorites] = useState({});
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() =>{
     fetch(`${process.env.NEXT_PUBLIC_URL}/api/products`)
     .then(response => response.json())
     .then(data =>{
      setProducts(data)
      setLoading(false)
     })
     .catch(e =>{
        console.error("Error fetching products:", e);
        setLoading(false);
      }) 
    },[]);
    
    const filteredProducts = useMemo(() => {
      if (selectedCategory === "all") return products;
      return products.filter((p) => p.categories.includes(selectedCategory));
    }, [selectedCategory, products]);    

  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#222222]/20 border-t-[#222222]" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }
  
  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <main className="min-h-screen bg-white pb-16">
      {/* Category Ribbon */}
      <CategoryRibbon
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-8">
        {/* Dynamic Auto-Shifting Modern Hero Banner Carousel */}
        <HeroCarousel />

        {/* Texas Commerce Trust & Value Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 pt-2">
          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center gap-3 hover:border-[#222222] transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E0E0E0] flex items-center justify-center text-[#FF385C] shadow-xs group-hover:scale-110 transition-transform">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-[#222222]">100% Free Shipping</div>
              <div className="text-[11px] text-[#717171]">Statewide delivery across Texas</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center gap-3 hover:border-[#222222] transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E0E0E0] flex items-center justify-center text-[#FF385C] shadow-xs group-hover:scale-110 transition-transform">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-[#222222]">24h Store Pickup</div>
              <div className="text-[11px] text-[#717171]">Austin, Houston, Dallas hubs</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center gap-3 hover:border-[#222222] transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E0E0E0] flex items-center justify-center text-[#FF385C] shadow-xs group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-[#222222]">Central WH Stock</div>
              <div className="text-[11px] text-[#717171]">Verified live inventory</div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#EBEBEB] flex items-center gap-3 hover:border-[#222222] transition-colors group">
            <div className="w-10 h-10 rounded-xl bg-white border border-[#E0E0E0] flex items-center justify-center text-[#FF385C] shadow-xs group-hover:scale-110 transition-transform">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="font-extrabold text-xs text-[#222222]">PayHere Gateway</div>
              <div className="text-[11px] text-[#717171]">Card &amp; Cash on Delivery</div>
            </div>
          </div>
        </div>

        {/* Section Header */}
        <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#222222] tracking-tight">
              Featured Electronics &amp; Hardware
            </h2>
            <p className="text-xs text-[#717171] mt-0.5">
              Fulfillment to {selectedCity.name}, Texas • {filteredProducts.length} items available
            </p>
          </div>
          <Link
            href="/products"
            className="text-xs font-bold text-[#FF385C] hover:text-[#E00B41] flex items-center gap-1.5 hover:underline"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Product Cards Grid with Micro-Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 pt-1">
          {filteredProducts.map((product) => {
            const isFav = favorites[product.product_id];
            return (
              <Link
                key={product.product_id}
                href={`/products/${product.product_id}`}
                className="group flex flex-col space-y-3 cursor-pointer p-2.5 rounded-3xl hover:bg-[#F7F7F7] border border-transparent hover:border-[#EBEBEB] hover:shadow-lg transition-all duration-300 -translate-y-0 hover:-translate-y-1.5"
              >
                {/* Airbnb Image Box */}
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F7F7F7] border border-[#EBEBEB]">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />

                  {/* Heart Wishlist Overlay */}
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(product.product_id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full text-white/90 hover:scale-125 transition-transform cursor-pointer"
                    aria-label="Save to wishlist"
                  >
                    <Heart
                      className={`w-5 h-5 stroke-2 transition-all ${
                        isFav ? "fill-[#FF385C] text-[#FF385C] scale-110" : "fill-black/35 text-white"
                      }`}
                    />
                  </button>

                  {/* Badge */}
                  {product.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-white/95 text-[#222222] rounded-full shadow-sm backdrop-blur-xs">
                      {product.badge}
                    </span>
                  )}

                  {/* Floating Action Pill on Hover */}
                  <div className="absolute bottom-3 inset-x-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0 pointer-events-none">
                    <div className="w-full py-2 bg-white/95 backdrop-blur-md rounded-xl text-center text-xs font-bold text-[#222222] shadow-md border border-[#E0E0E0] flex items-center justify-center gap-1.5">
                      <span>View Specifications</span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#FF385C]" />
                    </div>
                  </div>
                </div>

                {/* Info Text */}
                <div className="space-y-1 text-xs px-1">
                  <div className="flex items-center justify-between font-bold text-[#222222]">
                    <span className="truncate pr-2 text-sm group-hover:text-[#FF385C] transition-colors">{product.name}</span>
                    <div className="flex items-center gap-1 shrink-0 text-xs">
                      <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                      <span>{product.rating}</span>
                    </div>
                  </div>

                  <p className="text-[#717171] text-xs">
                    {product.brand} • SKU: {product.sku}
                  </p>

                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-baseline gap-1 text-sm font-black text-[#222222]">
                      <span>${product.price.toFixed(2)}</span>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md border border-emerald-200">
                        Free Delivery
                      </span>
                    </div>
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
