"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Warehouse } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [category, setCategory] = useState([]);
  const [badge, setBadge] = useState("NEW");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const[categories, setCategories] = useState([]);
  const[loading, setLoading] = useState(true);
  useEffect(() =>{
    fetch("http://localhost:8000/api/categories")
    .then(response => response.json())
    .then(data => {
      setCategories(data);
      setLoading(false);
    })
    .catch(e => {
      console.error("Error fetching categories:", e);
      setLoading(false);
    });
  },[]);

  const [variants, setVariants] = useState([
    {
      temp_id : new Date().getTime(),
      variant_name: "Default Variant",
      sku: "WH-NEW-SKU-001",
      price: 299.99,
      stock: 50
    },
  ]);

  const addVariantField = () => {
    setVariants((prev) => [
      ...prev,
      {
        temp_id: new Date().getTime(),
        variant_name: `Variant ${prev.length + 1}`,
        sku: `WH-NEW-SKU-00${prev.length + 1}`,
        price: 299.99,
        stock: 25
      },
    ]);
  };

  const removeVariantField = (id) => {
    if (variants.length <= 1) return;
    setVariants((prev) => prev.filter((v) => v.temp_id !== id));
  };

  const updateVariant = (id, field, val) => {
    setVariants((prev) =>
      prev.map((v) => (v.temp_id === id ? { ...v, [field]: val } : v))
    );
  };

  const handleSubmit = async(e) => {
    try {
      e.preventDefault();

      const response = await fetch("http://localhost:8000/api/products",
        {
          method : 'POST',
          headers : {'Content-type' : 'application/json'},
          body : JSON.stringify({
            product_name : name,
            brand : brand,
            badge : badge,
            category : category,
            image_url : image,
            description : description,
            variants : variants
          })
        }
      )

      if(!response.ok){
        throw new Error("Failed to Create product..!")
      }

      router.push("/admin/products");
      alert("Product created Successfully",3000);
    } catch (e) {
      console.error("Creation failed:", e);
      alert("Failed to create product. Please try again.");
    }
  };

  if(loading){
    return <p>Loading Categories...!</p>
  }

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
          Warehouse Inventory Setup
        </span>
        <h1 className="text-2xl font-black text-[#222222] mt-0.5">
          Add New Product &amp; Variants
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Details */}
        <div className="border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 text-xs shadow-xs">
          <div className="font-bold text-sm text-[#222222]">1. General Product Details</div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[#222222] font-bold mb-1">Product Title</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. ApexPad 11 Pro Tablet"
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <div>
              <label className="block text-[#222222] font-bold mb-1">Brand Name</label>
              <input
                type="text"
                required
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. ApexTech"
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <div>
              <label className="block text-[#222222] font-bold mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs font-bold text-[#222222]"
              >
                {categories.map(c =>{
                  return< option key={c.category_id} value={c.category_name}>{c.category_name}</option>
                })}
              </select>
            </div>

            <div>
              <label className="block text-[#222222] font-bold mb-1">Badge Tag</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="HOT, NEW, SALE"
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#222222] font-bold mb-1">Image URL</label>
              <input
                type="text"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#222222] font-bold mb-1">Detailed Description</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product hardware specifications..."
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>
          </div>
        </div>

        {/* Variant Setup */}
        <div className="border border-[#DDDDDD] rounded-3xl p-6 bg-white space-y-4 text-xs shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold text-sm text-[#222222]">2. Variant &amp; Central Warehouse SKU Setup</div>
              <p className="text-[11px] text-[#717171]">
                Each variant determines price, SKU code, and stock count at the Central Texas Warehouse.
              </p>
            </div>
            <button
              type="button"
              onClick={addVariantField}
              className="bg-[#222222] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Variant</span>
            </button>
          </div>

          <div className="space-y-3">
            {variants.map((v, idx) => (
              <div
                key={v.temp_id}
                className="p-4 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] space-y-3 relative"
              >
                <div className="flex items-center justify-between font-bold text-[#222222]">
                  <span>Variant #{idx + 1}</span>
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariantField(v.temp_id)}
                      className="text-[#717171] hover:text-[#FF385C] p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-[#717171] text-[11px] mb-1 font-bold">
                      Variant Name
                    </label>
                    <input
                      type="text"
                      required
                      value={v.variant_name}
                      onChange={(e) => updateVariant(v.temp_id, "variant_name", e.target.value)}
                      placeholder="e.g. Space Gray / 128GB"
                      className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs text-[#222222]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#717171] text-[11px] mb-1 font-bold">
                      Warehouse SKU
                    </label>
                    <input
                      type="text"
                      required
                      value={v.sku}
                      onChange={(e) => updateVariant(v.temp_id, "sku", e.target.value)}
                      className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs font-mono text-[#222222]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#717171] text-[11px] mb-1 font-bold">
                      Price ($ USD)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={v.price}
                      onChange={(e) => updateVariant(v.temp_id, "price", parseFloat(e.target.value))}
                      className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs font-mono text-[#222222]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#717171] text-[11px] mb-1 font-bold">
                      Initial WH Stock
                    </label>
                    <input
                      type="number"
                      required
                      value={v.stock}
                      onChange={(e) => updateVariant(v.temp_id, "stock", parseInt(e.target.value, 10))}
                      className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs font-mono text-[#222222]"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Link
            href="/admin/products"
            className="py-3 px-6 border border-[#DDDDDD] text-[#222222] font-bold text-xs rounded-xl hover:bg-[#F7F7F7]"
          >
            Cancel
          </Link>
          <button
            type="submit"
            className="py-3 px-8 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl shadow-md"
          >
            Save Product to Database
          </button>
        </div>
      </form>
    </div>
  );
}
