"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Warehouse } from "lucide-react";

export default function EditProductPage({ params }) {
  const unwrappedParams = use(params);
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading ,setLoading] = useState(true);

  //product_details
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [description, setDescription] = useState("");
  const [badge, setBadge] = useState("FEATURED");
  const [variants, setVariants] = useState([]);

  useEffect(()=>{
    fetch(`http://localhost:8000/api/products/${unwrappedParams.id}`)
    .then(response => response.json())
    .then(data => {
      setProduct(data);
      setLoading(false);
      setName(data.name);
      setBrand(data.brand);
      setDescription(data.description);
      setVariants(data.variants);
      setBadge(data.badge || " ");
    })
    .catch((e) =>{
        console.error("error:",e);
        setLoading(false);
    })
  },[unwrappedParams.id]);

  if(loading){
    return <p>Product loading...!</p>
  }

  const updateVariant = (id, field, val) => {
    setVariants((prev) =>
      prev.map((v) => (v.variant_id === id ? { ...v, [field]: val } : v))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();

    try {
        const response = await fetch(`http://localhost:8000/api/products/${unwrappedParams.id}`,{
          method : 'PUT',
          headers : {'Content-type' :'application/json'},
          body : JSON.stringify({
            up_product_name : name,
            up_product_brand : brand,
            up_product_badge : badge,
            up_product_description : description,
            up_variants : variants
          })
        })

        if(!response.ok){
          throw new Error("Failed to update product");
        }

        router.push("/admin/products");
    } catch (e) {
        console.error("Update failed:", e);
        alert("Failed to update product. Please try again.");
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-xs font-bold text-[#717171] hover:text-[#222222]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Product Management</span>
      </Link>

      <div className="border-b border-[#EBEBEB] pb-4">
        <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
          Edit Existing Catalogue Entry
        </span>
        <h1 className="text-2xl font-black text-[#222222] mt-0.5">
          Edit Product: {product.name}
        </h1>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 text-xs shadow-xs">
          <div className="font-bold text-sm text-[#222222]">Product Information</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#222222] font-bold mb-1">Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <div>
              <label className="block text-[#222222] font-bold mb-1">Brand</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#222222] font-bold mb-1">Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>
          </div>
        </div>

        {/* Variants */}
        <div className="border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 text-xs shadow-xs">
          <div className="font-bold text-sm text-[#222222]">Variants &amp; WH Stock Controls</div>

          <div className="space-y-3">
            {variants.map((v) => (
              <div key={v.variant_id} className="p-4 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#717171] text-[11px] mb-1 font-bold">Variant</label>
                  <input
                    type="text"
                    value={v.variant_name}
                    onChange={(e) => updateVariant(v.variant_id, "name", e.target.value)}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[#717171] text-[11px] mb-1 font-bold">SKU</label>
                  <input
                    type="text"
                    value={v.sku}
                    onChange={(e) => updateVariant(v.variant_id, "sku", e.target.value)}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs font-mono text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[#717171] text-[11px] mb-1 font-bold">Price ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={v.price}
                    onChange={(e) => updateVariant(v.variant_id, "price", parseFloat(e.target.value))}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs font-mono text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[#717171] text-[11px] mb-1 font-bold">Stock</label>
                  <input
                    type="number"
                    value={v.stock}
                    onChange={(e) => updateVariant(v.variant_id, "stock", parseInt(e.target.value, 10))}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs font-mono text-[#222222]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="py-3 px-6 border border-[#DDDDDD] text-[#222222] font-bold text-xs rounded-xl hover:bg-[#F7F7F7]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="py-3 px-8 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Update Database Entry</span>
          </button>
        </div>
      </form>
    </div>
  );
}
