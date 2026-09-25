"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  Warehouse,
  CheckCircle2,
} from "lucide-react";

export default function AdminProductsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCat, setSelectedCat] = useState("all");

  // Modal States
  const [viewProduct, setViewProduct] = useState(null);
  const [deleteProduct, setDeleteProduct] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8000/api/products/admin")
      .then((response) => response.json())
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((e) => {
        console.error("Error fetching products:", e);
        setLoading(false);
      })
  }, []);

  const filteredProducts = products.filter((p) => {
    if (selectedCat !== "all" && !p.categories.includes(selectedCat)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = p.name.toLowerCase().includes(q);
      const matchesBrand = p.brand.toLowerCase().includes(q);
      const matchesSku = p.variants.some((v) => v.sku.toLowerCase().includes(q));
      if (!matchesName && !matchesBrand && !matchesSku) return false;
    }
    return true;
  });

  const handleDeleteConfirm = async(e) => {
    if (!deleteProduct) return;

    try {
        const response = await fetch(`http://localhost:8000/api/products/${deleteProduct.product_id}`,{
          method : 'DELETE',
        })

        if(!response.ok){
          throw new Error("Failed to update product");
        }

        setProducts((prev) => prev.filter((item) => item.product_id !== deleteProduct.product_id));
        setActionSuccess(`Product "${deleteProduct.name}" removed from Texas database.`);
        setDeleteProduct(null);
        setTimeout(() => setActionSuccess("Product Delete Successfully"), 3000);

    } catch (e) {
        console.error("Delete failed:", e);
        alert("Failed to delete product. Please try again.");
    }
  };

  if (loading) {
    return <p>Products loading...!</p>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-5">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            Catalog &amp; Stock Keeping
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Product Management
          </h1>
        </div>
        <Link
          href="/admin/products/new"
          className="bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold px-5 py-3 rounded-full transition-colors shadow-md inline-flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product &amp; Variants</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess("")} className="text-emerald-700 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="border border-[#DDDDDD] rounded-2xl p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#717171] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by product name, brand, or SKU..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F7] border border-[#DDDDDD] rounded-full focus:outline-none focus:border-[#222222]"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-[#F7F7F7] border border-[#DDDDDD] rounded-full px-4 py-2.5 font-bold text-[#222222] focus:outline-none"
          >
            <option value="all">All Categories</option>
            <option value="mobiles">Mobiles &amp; Tablets</option>
            <option value="audio">Audio Devices</option>
            <option value="toys">Smart Toys</option>
            <option value="wearables">Wearables</option>
            <option value="gaming">Drones &amp; Gaming</option>
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Product &amp; Brand</th>
                <th className="py-4 px-4">Categories</th>
                <th className="py-4 px-4">Variants &amp; SKUs</th>
                <th className="py-4 px-4">Price Range</th>
                <th className="py-4 px-4">Stock Status</th>
                <th className="py-4 px-6 text-right">Actions (View / Edit / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {filteredProducts.map((p) => {
                const totalStock = p.variants.reduce((acc, v) => acc + v.stock, 0);
                const defaultVariant = p.variants[0];
                const productCategories = p.categories && Array.isArray(p.categories) ? p.categories : (p.categories ? p.categories.split(",") : []);

                return (
                  <tr key={p.product_id} className="hover:bg-[#F7F7F7] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-[#EBEBEB] shrink-0"
                        />
                        <div>
                          <div className="font-bold text-[#222222] text-sm">{p.name}</div>
                          <div className="text-[11px] text-[#717171]">{p.brand}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="flex flex-wrap gap-1">
                        {productCategories.map((c) => (
                          <span
                            key={c}
                            className="px-2 py-0.5 rounded-full bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] text-[10px] font-bold uppercase"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-[#222222]">
                          {p.variants.length} variant option(s)
                        </div>
                        <div className="text-[10px] font-mono text-[#717171]">
                          Primary: {defaultVariant.sku}
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4 font-bold text-[#222222] font-mono">
                      ${defaultVariant.price}
                    </td>

                    <td className="py-4 px-4">
                      {totalStock > 0 ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                          {totalStock} in stock
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 font-bold text-[10px]">
                          Restocking (+3d)
                        </span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewProduct(p)}
                          className="p-2 rounded-xl hover:bg-[#EBEBEB] text-[#717171] hover:text-[#222222]"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/products/${p.product_id}/edit`}
                          className="p-2 rounded-xl hover:bg-[#EBEBEB] text-[#717171] hover:text-[#222222]"
                          title="Edit Product"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteProduct(p)}
                          className="p-2 rounded-xl hover:bg-rose-50 text-[#717171] hover:text-[#FF385C]"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* VIEW PRODUCT MODAL */}
      {viewProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#DDDDDD] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
              <span className="text-xs font-bold text-[#FF385C] uppercase">
                Product Details View
              </span>
              <button
                onClick={() => setViewProduct(null)}
                className="p-1 rounded-full hover:bg-[#F7F7F7] text-[#717171]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={viewProduct.image_url}
                alt={viewProduct.name}
                className="w-20 h-20 rounded-2xl object-cover border border-[#DDDDDD]"
              />
              <div className="space-y-1">
                <div className="font-black text-lg text-[#222222]">{viewProduct.name}</div>
                <div className="text-xs text-[#717171]">Brand: {viewProduct.brand}</div>
                <div className="text-xs font-bold text-amber-500">★ {viewProduct.rating} ({viewProduct.reviewCount} reviews)</div>
              </div>
            </div>

            <p className="text-xs text-[#717171] leading-relaxed">
              {viewProduct.description}
            </p>

            <div className="space-y-2 border-t border-[#EBEBEB] pt-3">
              <div className="text-xs font-bold text-[#222222]">Variant Configurations &amp; SKUs</div>
              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {viewProduct.variants.map((v) => (
                  <div
                    key={v.variant_id}
                    className="p-2.5 rounded-xl bg-[#F7F7F7] border border-[#DDDDDD] flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#222222]">{v.name}</div>
                      <div className="text-[10px] font-mono text-[#717171]">SKU: {v.sku}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold font-mono text-[#222222]">${v.price}</div>
                      <div className="text-[10px] text-[#717171]">{v.stock} in stock</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewProduct(null)}
                className="bg-[#222222] text-white text-xs font-bold px-5 py-2.5 rounded-full"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DDDDDD] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-[#222222]">Delete Product?</h3>
              <p className="text-xs text-[#717171]">
                Are you sure you want to remove <strong>"{deleteProduct.name}"</strong> and all associated warehouse SKUs from the Texas database?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteProduct(null)}
                className="flex-1 py-3 border border-[#DDDDDD] text-[#222222] font-bold text-xs rounded-xl hover:bg-[#F7F7F7]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Yes, Delete Product
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
