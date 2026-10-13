"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { Search, Star, Heart, SlidersHorizontal } from "lucide-react";


export default function ProductsSearchPage() {
  const { selectedCity } = useShop();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [favorites, setFavorites] = useState({});
  const [products, setproducts ] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() =>{
    const timer = setTimeout(() =>{
      setDebouncedSearch(searchQuery);
    }, 300) // Delay 300ms to send an api to search

    return () => clearTimeout(timer);
  },[searchQuery]);
  
  useEffect(()=>{
      const params = new URLSearchParams();
      if(selectedCat !== "all") params.append("category", selectedCat);
      if(debouncedSearch.trim()) params.append("search",debouncedSearch.trim());

      fetch(`${process.env.NEXT_PUBLIC_URL}/api/products?${params.toString()}`)
      .then(response => {
        if(!response.ok) throw new Error("Error fetching products")
          return response.json()
        })
      .then(data => {
        setproducts(data);
        setLoading(false);
      })
      .catch(err =>{
        console.error("Error fetching products:",err);
        setproducts([]);
        setLoading(false);
      })
  },[selectedCat, debouncedSearch]);

  useEffect(() =>{
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/categories`)
    .then(response => response.json())
    .then(data => setCategories(data))
    .catch(err => console.log("Error fetching categories",err))
  },[]);
    
  const toggleFavorite = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFavorites((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const categoryOptions = [
    {id: "all", name: "All"},
    ...categories.map(c =>(
      {
        id: c.category_name,
        name : c.category_name
      }
    ))
  ];
  
  const filtered = useMemo(() => {
    return products.filter((item) => {
      if (inStockOnly && !(item.stock> 0)) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      if (sortBy === "rating") return b.rating - a.rating;
      return 0;
    });
  }, [products, inStockOnly, sortBy]);
  
  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#222222]/20 border-t-[#222222]" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Search Bar Area */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-6">
          <div>
            <h1 className="text-2xl font-black text-[#222222]">
              Search Product Catalog
            </h1>
            <p className="text-xs text-[#717171] mt-0.5">
              Explore electronics, smart devices, and accessories in BrightBuy.
            </p>
          </div>

          {/* Search Capsule Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#717171] absolute left-4 top-3.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Search products, brands, or warehouse SKUs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 text-xs bg-white border border-[#DDDDDD] rounded-full focus:outline-none focus:border-[#222222] shadow-sm text-[#222222]"
              />
            {searchQuery && (
              <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-3 text-xs font-bold text-[#717171] hover:text-[#222222]"
              >
                ×
              </button>
            )}
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Category Filter Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {categoryOptions.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCat(cat.id)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all border ${
                      selectedCat === cat.id
                        ? "bg-[#222222] text-white border-[#222222]"
                        : "bg-white text-[#222222] border-[#DDDDDD] hover:border-[#222222]"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
          
          {/* Auxiliary Options */}
          <div className="flex items-center gap-3 shrink-0">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-[#DDDDDD] rounded-full px-3.5 py-2 text-xs font-semibold text-[#222222] bg-white focus:outline-none hover:border-[#222222]"
            >
              <option value="featured">Sort: Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-xs font-semibold text-[#717171]">
        {filtered.length} products available
      </div>

      {/* Product Cards Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center border border-[#DDDDDD] rounded-3xl p-8 bg-[#F7F7F7]">
          <h3 className="font-bold text-[#222222] text-base">No products match your search</h3>
          <p className="text-xs text-[#717171] mt-1">
            Try adjusting your search keywords or clearing filters.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCat("all");
              setInStockOnly(false);
            }}
            className="mt-4 bg-[#222222] text-white text-xs font-bold px-6 py-2.5 rounded-full hover:bg-black transition-all active:scale-95 cursor-pointer shadow-sm"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((item) => {
            const isFav = favorites[item.product_id];
            return (
              <Link
                key={item.product_id}
                href={`/products/${item.product_id}`}
                className="group flex flex-col space-y-3 cursor-pointer p-2.5 rounded-3xl border border-transparent hover:border-[#EBEBEB] hover:bg-white hover:shadow-xl transition-all duration-300 -translate-y-0 hover:-translate-y-1.5"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F7F7F7] border border-[#EBEBEB]">
                  <img
                    src={item.image_url}
                    onError={(e) => { 
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder.png';
                    }}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 ease-out"
                  />
                  
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(item.product_id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-xs text-neutral-700 hover:text-[#FF385C] hover:scale-115 transition-all shadow-xs cursor-pointer z-10"
                    aria-label="Save to favorites"
                  >
                    <Heart
                      className={`w-4 h-4 stroke-2 ${
                        isFav ? "fill-[#FF385C] text-[#FF385C]" : "text-[#555555]"
                      }`}
                    />
                  </button>

                  {item.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider bg-white/95 backdrop-blur-xs text-[#222222] rounded-full shadow-xs border border-white/40">
                      {item.badge}
                    </span>
                  )}

                  {/* Free Delivery Tag */}
                  <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 text-[9px] font-extrabold bg-emerald-600/90 text-white rounded-md backdrop-blur-xs shadow-2xs">
                    Free TX Shipping
                  </span>

                  {/* Quick View overlay button */}
                  <div className="absolute inset-x-3 bottom-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 hidden sm:block">
                    <div className="w-full py-2 bg-neutral-900/90 backdrop-blur-md text-white text-[11px] font-bold rounded-xl text-center shadow-lg hover:bg-black">
                      View Hardware Unit
                    </div>
                  </div>
                </div>

                <div className="space-y-1 text-xs px-1">
                  <div className="flex items-center justify-between font-bold text-[#222222]">
                    <span className="truncate pr-2 text-sm font-extrabold group-hover:text-[#FF385C] transition-colors">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-1 shrink-0 text-xs font-black">
                      {Number(item.rating) > 0 ? (
                        <>
                          <Star className="w-3.5 h-3.5 fill-[#FF385C] text-[#FF385C]" />
                          <span>{Number(item.rating).toFixed(1)}</span>
                        </>
                      ) : (
                        <span className="text-[#717171] font-normal">No rating</span>
                      )}
                    </div>
                  </div>

                  <p className="text-[#717171] text-xs font-medium truncate">
                    {item.brand} • SKU: {item.sku}
                  </p>

                  <div className="pt-1.5 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1 text-base font-black text-[#222222]">
                      <span>${Number(item.price || 0).toFixed(2)}</span>
                    </div>
                    <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                      Austin Stock
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </main>
  );
}
