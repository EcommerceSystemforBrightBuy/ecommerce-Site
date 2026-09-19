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
  const[categories, setcategories] = useState([]);
  
  useEffect(()=>{
    fetch('http://localhost:8000/api/categories')
    .then(response => response.json())
    .then(data => setcategories(data))
  },[]);

  const getCategoryIcon = (name) => {
    switch (name?.toLowerCase()) {
      case "mobiles":
        return <Smartphone className="w-6 h-6" />;
      case "audio":
        return <Headphones className="w-6 h-6" />;
      case "toys":
        return <Bot className="w-6 h-6" />;
      case "wearables":
        return <Watch className="w-6 h-6" />;
      case "gaming":
        return <Gamepad2 className="w-6 h-6" />;
      default:
        return <Sparkles className="w-6 h-6" />;
    }
  };

  return (
    <div className="border-b border-[#EBEBEB] bg-white sticky top-20 z-30 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-8 overflow-x-auto scrollbar-none">
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
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
