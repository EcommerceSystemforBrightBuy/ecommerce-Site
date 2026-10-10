"use client";

import { useEffect, useState } from "react";
import {
  Warehouse,
  AlertTriangle,
  CheckCircle2,
  Search,
} from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_URL || "http://localhost:8000").replace(/\/$/, "");

const readInventory = async () => {
  const response = await fetch(`${API_URL}/api/inventory`);
  if (!response.ok) {
    throw new Error("Failed to fetch inventory");
  }
  return response.json();
};

export default function AdminInventoryPage() {
  const [skuList, setSkuList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [stockNotice, setStockNotice] = useState("");
  const [stockError, setStockError] = useState("");
  const [inventoryError, setInventoryError] = useState("");
  const [adjustments, setAdjustments] = useState({});
  const [updatingSku, setUpdatingSku] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    readInventory()
      .then((data) => {
        if (active) setSkuList(data);
      })
      .catch((error) => {
        console.error("Inventory fetch error:", error);
        if (active) setInventoryError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const refreshInventory = async () => {
    try {
      setLoading(true);
      setInventoryError("");
      setSkuList(await readInventory());
    } catch (error) {
      console.error("Inventory fetch error:", error);
      setInventoryError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAdjustStock = async (sku) => {
    const adjustment = Number(adjustments[sku]);
    if (!Number.isInteger(adjustment) || adjustment === 0) {
      setStockError("Enter a non-zero whole number. Use a positive value to add stock or a negative value to remove it.");
      return;
    }

    try {
      setUpdatingSku(sku);
      setStockError("");
      const response = await fetch(`${API_URL}/api/inventory/${encodeURIComponent(sku)}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          adjustment,
          type: adjustment > 0 ? "restock" : "adjustment",
        }),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        throw new Error(result.message || result.error || "Failed to update stock");
      }

      setStockNotice(`SKU ${sku} inventory updated.`);
      setTimeout(() => setStockNotice(""), 2500);
      setAdjustments((previous) => ({ ...previous, [sku]: "" }));
      await refreshInventory();
    } catch (error) {
      console.error("Stock update error:", error);
      setStockError(error.message);
    } finally {
      setUpdatingSku(null);
    }
  };

  const filteredSkus = skuList.filter((item) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.sku.toLowerCase().includes(q) ||
      item.product_name.toLowerCase().includes(q) ||
      item.variant_name.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-5">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            Stock Keeping &amp; Replenishment
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Central Warehouse Stock Manager
          </h1>
        </div>
      </div>

      {stockNotice && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{stockNotice}</span>
        </div>
      )}
      {stockError && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 font-bold">
          {stockError}
        </div>
      )}
      {inventoryError && (
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 font-bold">
          Unable to load inventory: {inventoryError}
        </div>
      )}

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
                <th className="py-4 px-6 text-right">Stock Adjustment (+/- units)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {loading ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-[#717171]">
                    Loading inventory...
                  </td>
                </tr>
              ) : inventoryError ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-red-700">
                    Inventory data is unavailable.
                  </td>
                </tr>
              ) : filteredSkus.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-6 text-center text-[#717171]">
                    No inventory records found.
                  </td>
                </tr>
              ) : (
                filteredSkus.map((item) => {
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
                        <div>
                          <div className="font-bold text-[#222222]">{item.product_name}</div>
                          <div className="text-[11px] text-[#717171]">{item.variant_name}</div>
                        </div>
                      </td>

                      <td className="py-4 px-4 font-mono font-bold text-[#222222]">
                        ${Number(item.price || 0).toFixed(2)}
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
                        <form
                          className="flex items-center justify-end gap-2"
                          onSubmit={(event) => {
                            event.preventDefault();
                            handleAdjustStock(item.sku);
                          }}
                        >
                          <input
                            type="number"
                            step="1"
                            value={adjustments[item.sku] ?? ""}
                            onChange={(event) =>
                              setAdjustments((previous) => ({
                                ...previous,
                                [item.sku]: event.target.value,
                              }))
                            }
                            aria-label={`Stock adjustment for ${item.sku}`}
                            placeholder="+/- quantity"
                            className="w-28 px-2.5 py-1 rounded-lg border border-[#DDDDDD] text-right font-mono text-[#222222] focus:outline-none focus:border-[#222222]"
                          />
                          <button
                            type="submit"
                            disabled={updatingSku === item.sku}
                            className="px-2.5 py-1 rounded-lg border border-[#DDDDDD] bg-[#FF385C] text-white font-bold disabled:opacity-50"
                          >
                            {updatingSku === item.sku ? "Saving..." : "Apply"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
