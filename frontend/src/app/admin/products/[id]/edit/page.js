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
  const [submitting, setSubmitting] = useState(false);

  //product_details
  const [name, setName] = useState("");
  const [brand, setBrand] = useState("");
  const [badge, setBadge] = useState("");
  const [image, setImage] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [variants, setVariants] = useState([]);

  useEffect(()=>{
    fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/${unwrappedParams.id}`)
    .then(response =>{
      if(!response.ok) throw new Error("Product not found");
      return response.json();
    })
    .then(data => {
      setProduct(data);
      setLoading(false);
      setName(data.name);
      setBrand(data.brand);
      setBadge(data.badge ?? "");
      setImage(data.image_url ?? "");
      setDescription(data.description);
      setVariants(data.variants.map(v =>(
        {...v, stock: v.stock ?? 0}
      )));
    })
    .catch((err) =>{
        console.error("error:",err);
        setLoading(false);
    })
  },[unwrappedParams.id]);

  useEffect(() => {
  fetch(`${process.env.NEXT_PUBLIC_URL}/api/categories`)
    .then(response => response.json())
    .then(data => {
      setCategories(data)
      setCategory(data[0]?.category_name || "");
    })
    .catch(err => console.error(err));
  }, []);
  
  if(loading){
    return <p>Product loading...!</p>
  }

  if(!product){
    return <p>Product not Found...!</p>
  }

  const updateVariant = (id, field, val) => {
    setVariants((prev) =>
      prev.map((v) => (v.variant_id === id ? { ...v, [field]: val } : v))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/${unwrappedParams.id}`,{
          method : 'PUT',
          headers : {'Content-type' :'application/json'},
          body : JSON.stringify({
            up_product_name : name,
            up_product_brand : brand,
            up_product_badge : badge,
            up_product_category : category,
            up_product_image : image,
            up_product_description : description,
            up_variants : variants
          })
        })

        if(!response.ok){
          const data = await response.json();
          throw new Error(data.message || "Failed to update product");
        }

        alert("Product updated successfully");
        router.push("/admin/products");
    } catch (err) {
        console.error("Update failed:", err);
        alert(err.message || "Failed to update product");
    }finally {
        setSubmitting(false);
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

            <div>
              <label className="block text-[#222222] font-bold mb-1">Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="HOT, NEW, SALE"
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <div>
              <label className="block text-[#222222] font-bold mb-1">Category</label>
              <select
                required
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs font-bold text-[#222222]"
              >
                <option value="">Select a Category</option>
                {categories.map(c =>{
                  return<option key={c.category_id} value={c.category_name}>{c.category_name}</option>
                })}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[#222222] font-bold mb-1">Image URL</label>
              <input
                type="url"
                required
                value={image}
                onChange={(e) => setImage(e.target.value)}
                onError={(e) => { 
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/placeholder.png';
                }}
                placeholder="https://images.abc.com/..."
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
              {image && (
                  <img src={image} alt="Preview" className="mt-2 h-24 rounded-xl object-cover" />
              )}
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
                    required
                    onChange={(e) => updateVariant(v.variant_id, "variant_name", e.target.value)}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[#717171] text-[11px] mb-1 font-bold">SKU</label>
                  <input
                    type="text"
                    value={v.sku}
                    required
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
                    min="0"
                    required
                    onChange={(e) => updateVariant(v.variant_id, "price", e.target.value)}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs font-mono text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[#717171] text-[11px] mb-1 font-bold">Stock</label>
                  <input
                    type="number"
                    value={v.stock}
                    min="0"
                    required
                    onChange={(e) => updateVariant(v.variant_id, "stock", e.target.value)}
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
            disabled={submitting}
            className="py-3 px-8 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="w-4 h-4" />
            <span>
              {submitting ? "Updating..." : "Update Database Entry"}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
