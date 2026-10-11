"use client";

import React from "react";
import {useState, useEffect} from "react";
import {
  Smartphone,
  Headphones,
  Bot,
  Watch,
  Gamepad2,
  Sparkles,
} from "lucide-react";

export default function CategoryRibbon({ selectedCategory, onSelectCategory }) {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/categories`)
      .then(response => response.json())
      .then(data => setCategories(Array.isArray(data) ? data : []))
      .catch(err => console.error("Error fetching categories:", err));
  }, []);

  const getCategoryIcon = (name) => {
    switch (name?.toLowerCase()) {
      case "mobiles":
      case "smartphones":
        return <Smartphone className="w-6 h-6" />;
      case "audio":
      case "headphones":
        return <Headphones className="w-6 h-6" />;
      case "toys":
      case "smart toys & stem":
        return <Bot className="w-6 h-6" />;
      case "wearables":
      case "wearables & watches":
        return <Watch className="w-6 h-6" />;
      case "gaming":
      case "drones & gaming":
        return <Gamepad2 className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  const categoryList = [
    { id: "all", name: "All Categories" },
    ...categories.map((c) => ({
      id: c.category_id || c.id || c.category_name,
      name: c.category_name || c.name || "Category",
    })),
  ];

  return (
    <div className="border-b border-[#EBEBEB] bg-white sticky top-20 z-30 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-8 overflow-x-auto scrollbar-none">
        {categoryList.map((cat, idx) => {
          const key = cat.id || `cat-${idx}`;
          const isActive =
            selectedCategory === cat.id ||
            selectedCategory === cat.name ||
            (selectedCategory === "all" && cat.id === "all");

          return (
            <button
              key={key}
              onClick={() => onSelectCategory(cat.name === "All Categories" ? "all" : cat.name)}
              className={`flex flex-col items-center gap-2 pb-2 text-xs font-semibold whitespace-nowrap transition-all border-b-2 shrink-0 group ${
                isActive
                  ? "border-[#222222] text-[#222222]"
                  : "border-transparent text-[#717171] hover:text-[#222222] hover:border-[#DDDDDD]"
              }`}
            >
              <div
                className={`transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? "text-[#FF385C]" : "text-[#717171] group-hover:text-[#222222]"
                }`}
              >
                {getCategoryIcon(cat.name)}
              </div>
              <span className="text-[12px]">{cat.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
