"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, CheckCircle2, Warehouse } from "lucide-react";

export default function AddProductPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [badge, setBadge] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const[categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const[loading, setLoading] = useState(true);
  const[submitting, setSubmitting] = useState(false); //For preventing user from resubmitting the same product

  useEffect(() =>{
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/categories`)
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
      variant_name: "",
      sku: "",
      price: "",
      stock: "",
      attributes : []
    },
  ]);

  const addVariantField = () => {
    setVariants((prev) => [
      ...prev,
      {
        temp_id: new Date().getTime(),
        variant_name: "",
        sku: "",
        price: "",
        stock: "",
        attributes : []
      },
    ]);
  };

  const addAttribute = (variant_id) => {
    setVariants((prev) => 
      prev.map((v) =>
        v.temp_id === variant_id ?
        {...v, attributes : [...v.attributes, { attr_id: Date.now(), attribute_name:"", attribute_value:""}]}  
        : v
      )
    )
  };



  const updateAttribute = (variant_id, attrId, field, value) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.temp_id === variant_id ?
        {...v, attributes: v.attributes.map((a) => (
            a.attr_id === attrId ? {...a, [field] : value} : a))}  
        : v
      )
    );
  };
 
  const deleteAttribute = (variant_id, attrId) => {
    setVariants((prev) =>
      prev.map((v) =>
        v.temp_id === variant_id ?
        {...v, attributes : v.attributes.filter((a) => a.attr_id !== attrId)}
        : v
      )
    );
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

  const toggleCategory = (category_name) =>{
    setSelectedCategories((prev) =>
      prev.includes(category_name) ?
      prev.filter((c) => c !== category_name) : [...prev, category_name]
    );
  };

  const handleSubmit = async(e) => {
    e.preventDefault();
    
    try {

      if(selectedCategories.length === 0){
        alert("Select at least one category");
        return;
      }
      
      setSubmitting(true);
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/products`,
        {
          method : 'POST',
          headers : {'Content-type' : 'application/json'},
          body : JSON.stringify({
            product_name : name,
            brand : brand,
            badge : badge,
            categories : selectedCategories,
            image_url : image,
            description : description,
            variants : variants
          })
        }
      )

      if(!response.ok){
        const data = await response.json();
        throw new Error(data.error || "Failed to Create product..!")
      }

      alert("Product created Successfully");
      router.push("/admin/products");
    } catch (err) {
      console.error("Creation failed:", err);
      alert(err.message);
    }finally{
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#222222]/20 border-t-[#222222]" />
        <span className="sr-only">Loading…</span>
      </div>
    );
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

            <div className="sm:col-span-2">
              <p className="text-[11px] text-[#717171] mt-2">
                {selectedCategories.length} selected
              </p>
              <label className="block text-[#222222] font-bold mb-2">
                Categories <span className="text-[#717171] font-normal">(select one or more)</span>
              </label>
                <div className="flex flex-wrap gap-2">
                  {categories.map(c =>{
                    const isSelected = selectedCategories.includes(c.category_name);
                    
                    return(
                       <button
                        key={c.category_id}
                        type="button"
                        onClick={() => toggleCategory(c.category_name)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold border transition-all ${
                          isSelected
                            ? "bg-[#222222] text-white border-[#222222]"
                            : "bg-white text-[#222222] border-[#DDDDDD] hover:border-[#222222]"
                        }`}
                      >
                        {isSelected && "✓ "}
                        {c.category_name}
                      </button>
                    )
                  })}
                </div>
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
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                placeholder="https://images.abc.com/..."
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
                />
              {image && (
                  <div className="mt-3 w-40 h-40 rounded-2xl overflow-hidden border border-[#DDDDDD] bg-[#F7F7F7]">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/placeholder.png";
                      }}
                    />
                  </div>
              )}
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
                      placeholder="SKU-PRD001-01"
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
                      min="0"
                      required
                      value={v.price}
                      onChange={(e) => updateVariant(v.temp_id, "price", e.target.value)}
                      placeholder="0.00"
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
                      min="0"
                      value={v.stock}
                      onChange={(e) => updateVariant(v.temp_id, "stock", e.target.value)}
                      placeholder="0"
                      className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs font-mono text-[#222222]"
                    />
                  </div>
                </div>

                 <div className="block w-full pt-3 border-t border-[#DDDDDD] space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-[#717171]">
                      Attributes <span className="font-normal">(Color, Storage, Size...)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => addAttribute(v.temp_id)}
                      className="bg-[#222222] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0 width:full"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Attribute</span>
                    </button>
                  </div>

                  {v.attributes.length === 0 && (
                    <p className="text-[11px] text-[#717171]">No attributes yet. Optional.</p>
                  )}

                  {v.attributes.map((a) => (
                    <div key={a.attr_id} className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_auto] gap-3 items-center w-full">
                      <input
                        type="text"
                        placeholder="Name (e.g. Color)"
                        value={a.attribute_name}
                        onChange={(e) => updateAttribute(v.temp_id, a.attr_id, "attribute_name", e.target.value)}
                        className="w-full min-w-0 bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs text-[#222222]"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Black)"
                        value={a.attribute_value}
                        onChange={(e) => updateAttribute(v.temp_id, a.attr_id, "attribute_value", e.target.value)}
                        className="w-full min-w-0 bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs text-[#222222]"
                      />
                      <button
                        type="button"
                        onClick={() => deleteAttribute(v.temp_id, a.attr_id)}
                        className="p-2 text-[#717171] hover:text-[#FF385C] justify-self-end"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
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
            disabled= {submitting}
            className="py-3 px-8 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "Saving..." : "Save Product to Database"}
          </button>
        </div>
      </form>
    </div>
  );
}
