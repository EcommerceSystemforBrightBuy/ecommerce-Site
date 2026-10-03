"use client";

import React, { use, useEffect, useState } from "react";
import { PRODUCTS } from "@/data/mockData";
import {
  Warehouse,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Search,
} from "lucide-react";

export default function AdminInventoryPage() {
  // Flatten variants with parent product info
  const initialSkus = PRODUCTS.flatMap((p) =>
    p.variants.map((v) => ({
      productId: p.id,
      productName: p.name,
      brand: p.brand,
      image: p.image,
      variantId: v.id,
      variantName: v.name,
      sku: v.sku,
      price: v.price,
      stock: v.stock,
    }))
  );

  const [skuList, setSkuList] = useState(initialSkus);
  const [searchQuery, setSearchQuery] = useState("");
  const [deboundedSearch, setDebouncedSearch] = useState("");
  const [stockNotice, setStockNotice] = useState("");

  const updateStock = (skuCode, delta) => {
    setSkuList((prev) =>
      prev.map((item) => {
        if (item.sku === skuCode) {
          const newStock = Math.max(0, item.stock + delta);
          return { ...item, stock: newStock };
        }
        return item;
      })
    );
    setStockNotice(`SKU ${skuCode} inventory updated.`);
    setTimeout(() => setStockNotice(""), 2500);
  };

  const filteredSkus = skuList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.sku.toLowerCase().includes(q) ||
      item.productName.toLowerCase().includes(q) ||
      item.variantName.toLowerCase().includes(q)
    );
  });

  useEffect(() =>{
    const timer = setTimeout(() =>{
      setDebouncedSearch(searchQuery);
    }, 300); //set timeout 300 ms for search queries

    return () => clearTimeout(timer);
  },[searchQuery]);
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-5">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            Stock Keeping &amp; Replenishment
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Central Warehouse Stock Manager
          </h1>
          <p className="text-xs text-[#717171] mt-0.5">
            Real-time SKU inventory tracking for Travis Central Warehouse (Austin, TX).
          </p>
        </div>
      </div>

      {stockNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{stockNotice}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="border border-[#DDDDDD] rounded-2xl p-4 bg-white flex items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-[#717171] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search SKU code, product, or variant..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F7F7] border border-[#DDDDDD] rounded-full text-xs text-[#222222] focus:outline-none"
          />
        </div>
        <div className="text-xs font-bold text-[#717171]">
          Total SKUs Tracked: {skuList.length}
        </div>
      </div>

      {/* Inventory SKU Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Warehouse SKU Code</th>
                <th className="py-4 px-4">Product Name &amp; Variant</th>
                <th className="py-4 px-4">Price</th>
                <th className="py-4 px-4">WH Stock Quantity</th>
                <th className="py-4 px-4">Texas Logistics Status</th>
                <th className="py-4 px-6 text-right">Stock Adjustment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {filteredSkus.map((item) => {
                const isOutOfStock = item.stock <= 0;
                const isLowStock = item.stock > 0 && item.stock < 10;

                return (
                  <tr key={item.sku} className="hover:bg-[#F7F7F7] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#222222]">
                      <div className="flex items-center gap-2">
                        <Warehouse className="w-4 h-4 text-[#FF385C]" />
                        <span>{item.sku}</span>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.productName}
                          className="w-10 h-10 rounded-xl object-cover border border-[#EBEBEB]"
                        />
                        <div>
                          <div className="font-bold text-[#222222]">{item.productName}</div>
                          <div className="text-[11px] text-[#717171]">{item.variantName}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-mono font-bold text-[#222222]">
                      ${item.price.toFixed(2)}
                    </td>

                    <td className="py-4 px-4 font-mono font-black text-sm text-[#222222]">
                      {item.stock} units
                    </td>

                    <td className="py-4 px-4">
                      {isOutOfStock ? (
                        <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          Restocking (+3d ETA Buffer)
                        </span>
                      ) : isLowStock ? (
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 font-bold text-[10px] border border-amber-200">
                          Low Stock Warning
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                          Available
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => updateStock(item.sku, -5)}
                          className="px-2.5 py-1 rounded-lg border border-[#DDDDDD] bg-white hover:bg-[#F7F7F7] font-bold text-[#222222]"
                          title="Decrease 5"
                        >
                          -5
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStock(item.sku, -1)}
                          className="px-2.5 py-1 rounded-lg border border-[#DDDDDD] bg-white hover:bg-[#F7F7F7] font-bold text-[#222222]"
                          title="Decrease 1"
                        >
                          -1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStock(item.sku, +1)}
                          className="px-2.5 py-1 rounded-lg border border-[#DDDDDD] bg-white hover:bg-[#F7F7F7] font-bold text-[#222222]"
                          title="Increase 1"
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStock(item.sku, +10)}
                          className="px-2.5 py-1 rounded-lg border border-[#DDDDDD] bg-[#FF385C] text-white font-bold"
                          title="Restock 10"
                        >
                          +10
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
