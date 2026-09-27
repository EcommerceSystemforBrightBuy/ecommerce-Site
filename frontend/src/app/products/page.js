"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { Search, Star, Heart, SlidersHorizontal } from "lucide-react";


export default function ProductsSearchPage() {
  const { selectedCity } = useShop();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState("featured");
  const [favorites, setFavorites] = useState({});
  const[ products, setproducts ] = useState([]);
  const [categories, setCategories] = useState([]);
  
  useEffect(()=>{
      const params = new URLSearchParams();
      if(selectedCat !== "all") params.append("category", selectedCat);
      if(searchQuery.trim()) params.append("search",searchQuery.trim());

      fetch(`http://localhost:8000/api/products?${params.toString()}`)
      .then(response => {
        if(!response.ok) throw new Error("Error fetching products")
          return response.json()
        })
      .then(data => {
        setproducts(data);
      })
      .catch(err =>{
        console.error("Error fetching products:",err);
        setproducts([]);
      })
  },[selectedCat, searchQuery]);

  useEffect(() =>{
    fetch("http://localhost:8000/api/categories")
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
  
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-8 py-8 space-y-8">
      {/* Header Search Bar Area */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-6">
          <div>
            <h1 className="text-2xl font-black text-[#222222]">
              Search Catalog &amp; Texas Stock
            </h1>
            <p className="text-xs text-[#717171] mt-0.5">
              Showing real-time stock levels for {selectedCity.name}, Texas.
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
            <label className="flex items-center gap-2 cursor-pointer text-[#222222] font-semibold border border-[#DDDDDD] px-3.5 py-2 rounded-full hover:border-[#222222]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-3.5 h-3.5 rounded text-[#FF385C] focus:ring-0"
              />
              <span>In-Stock Only</span>
            </label>

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
        {filtered.length} products available in Central Texas Warehouse
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
            className="mt-4 bg-[#222222] text-white text-xs font-bold px-5 py-2.5 rounded-full"
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
                className="group flex flex-col space-y-3 cursor-pointer"
              >
                <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[#F7F7F7] border border-[#EBEBEB]">
                  <img
                    src={item.image_url}
                    onError={(e) => { 
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = '/placeholder.png';
                    }}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ease-out"
                  />
                  
                  <button
                    type="button"
                    onClick={(e) => toggleFavorite(item.product_id, e)}
                    className="absolute top-3 right-3 p-2 rounded-full text-white/90 hover:scale-110 transition-transform"
                  >
                    <Heart
                      className={`w-6 h-6 stroke-2 ${
                        isFav ? "fill-[#FF385C] text-[#FF385C]" : "fill-black/30 text-white"
                      }`}
                    />
                  </button>

                  {item.badge && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 text-[11px] font-bold bg-white/90 text-[#222222] rounded-full shadow-sm">
                      {item.badge}
                    </span>
                  )}
                </div>

                <div className="space-y-0.5 text-xs">
                  <div className="flex items-center justify-between font-bold text-[#222222]">
                    <span className="truncate pr-2 text-sm">{item.name}</span>
                    <div className="flex items-center gap-1 shrink-0 text-xs">
                      <Star className="w-3.5 h-3.5 fill-[#222222] text-[#222222]" />
                      <span>{item.rating ?? "No review yet"}</span>
                    </div>
                  </div>

                  <p className="text-[#717171] text-xs">
                    {item.brand} • SKU: {item.sku}
                  </p>

                  <div className="pt-1 flex items-baseline gap-1 text-sm font-extrabold text-[#222222]">
                    <span>${item.price?.toFixed(2)}</span>
                    <span className="text-xs font-normal text-[#717171]">total</span>
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
