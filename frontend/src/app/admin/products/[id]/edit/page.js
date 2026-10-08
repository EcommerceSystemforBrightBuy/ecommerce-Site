"use client";

import React, { useState, use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Warehouse, Plus, Trash2} from "lucide-react";

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
  const [selectedCategories, setSelectedCategories] = useState([]);
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
      setVariants(
        (data.variants ?? []).map((v) => ({
          ...v,
          stock: v.stock ?? 0,
          is_active: v.is_active ?? true,
          is_new: v.is_new ?? false,
          attributes: (v.attributes ?? []).map((a,i) => ({
            attr_id: `${v.variant_id}-${i}`,
            attribute_name: a.attribute_name ?? "",
            attribute_value: a.attribute_value ?? "",
          })),
        }))
      );
      setSelectedCategories(
        (data.categories ?? []).map(c => c.category_name).filter(Boolean)
      );
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
    })
    .catch(err => console.error(err));
  }, []);
  
  if (loading) {
    return (
      <div role="status" className="flex items-center justify-center min-h-screen">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#222222]/20 border-t-[#222222]" />
        <span className="sr-only">Loading…</span>
      </div>
    );
  }

  if(!product){
    return <p>Product not Found...!</p>
  }

  const getVariantId = (v) => v.variant_id ?? v.temp_id;

  const addVariant = () => {
    setVariants((prev) => [
      ...prev,
      {
        temp_id: new Date().getTime(),
        variant_name: "",
        sku: "",
        price: "",
        stock: "",
        is_new : true,
        is_active : true,
        attributes : []
      },
    ]);
  };

  const updateVariant = (temp_id, field, value) =>{
    setVariants((prev) =>
      prev.map((v) => (
        (getVariantId(v) === temp_id) ?
        {...v, [field]: value}
        : v
      ))  
    );
  };

  const removeVariant = (variantId) => {
    if(variants.length <= 1){
      alert("At least one variant is required.");
      return;
    }
    setVariants((prev) => 
      prev.flatMap(v => {
        if(getVariantId(v) !== variantId) return [v];
        if(v.is_new) return [];
        return [{...v, is_active : false}];
      })
    );
  };
  
  const addAttribute = (variantId) => {
    setVariants((prev) =>
    prev.map((v) => 
      getVariantId(v) === variantId ? 
        {...v, attributes : [...v.attributes, {
            attr_id : Date.now(),
            attribute_name : "",
            attribute_value : ""
        }]}
        : v
      )
    );  
  };

  const updateAttribute = (variantId, attrID, field, value) => {
      setVariants((prev) =>
        prev.map((v) => 
          getVariantId(v) === variantId ?
          { ...v, attributes : v.attributes.map((attri) =>
              (attri.attr_id === attrID ?
                  {...attri, [field]: value }
                  : attri
              )
          )}
          : v
        )
      )
  }

  const removeAttribute = (variantId,attrID) => {
    setVariants((prev) =>
      prev.map((v) =>
        getVariantId(v) === variantId
        ?{...v, attributes : v.attributes.filter(attri => attri.attr_id !== attrID )}
        : v
      )
    )
  } 

  const toggleCategory = (category_name) =>{
      setSelectedCategories((prev) =>
          prev.includes(category_name)
          ? prev.filter((c) => c !== category_name)
          : [...prev, category_name]
      );
  };

  const handleSave = async (e) => {
    e.preventDefault();

    if(selectedCategories.length === 0){
      alert("Select at least one category");
      return;
    }

    setSubmitting(true);

    try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/products/${unwrappedParams.id}`,{
          method : 'PUT',
          headers : {'Content-type' :'application/json'},
          body : JSON.stringify({
            up_product_name : name,
            up_product_brand : brand,
            up_product_badge : badge,
            up_product_categories : selectedCategories,
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

  const visibleVariants = variants.filter(v => v.is_active !== false);

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
              <label className="block text-[#222222] font-bold mb-1">Badge</label>
              <input
                type="text"
                value={badge}
                onChange={(e) => setBadge(e.target.value)}
                placeholder="HOT, NEW, SALE"
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <br></br>
            <div className="sm:col-span-2">
              <p className="text-[11px] text-[#717171] mt-2">
                {selectedCategories.length} selected
              </p>
              <label className="block text-[#222222] font-bold mb-2">
                Categories <span className="text-[#717171] font-normal">(Select all that apply)</span>
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
          <div className="font-bold text-sm text-[#222222]">Variants &amp; WH Stock Controls
            <p className="text-[11px] text-[#717171]">
              Each variant determines price, SKU code, and stock count at the Central Texas Warehouse.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="bg-[#222222] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full inline-flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Variant</span>
          </button>

          <div className="space-y-3">
            {visibleVariants.map((v, idx) => (
              <div
                key={getVariantId(v)}
                className="p-4 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] space-y-3 relative"
              >
                <div className="flex items-center justify-between font-bold text-[#222222]">
                  <span>Variant #{idx + 1}</span>
                  {visibleVariants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(getVariantId(v))}
                      className="text-[#717171] hover:text-[#FF385C] p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

              <div className="p-4 rounded-2xl border border-[#DDDDDD] bg-[#F7F7F7] grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[#717171] text-[11px] mb-1 font-bold">Variant</label>
                  <input
                    type="text"
                    value={v.variant_name}
                    required
                    onChange={(e) => updateVariant(getVariantId(v), "variant_name", e.target.value)}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs text-[#222222]"
                  />
                </div>

                <div>
                  <label className="block text-[#717171] text-[11px] mb-1 font-bold">SKU</label>
                  <input
                    type="text"
                    value={v.sku}
                    required
                    onChange={(e) => updateVariant(getVariantId(v), "sku", e.target.value)}
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
                    onChange={(e) => updateVariant(getVariantId(v), "price", e.target.value)}
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
                    onChange={(e) => updateVariant(getVariantId(v), "stock", e.target.value)}
                    className="w-full bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs font-mono text-[#222222]"
                  />
                </div>
                <div className="block w-full pt-3 border-t border-[#DDDDDD] space-y-3 sm:col-span-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[11px] font-bold text-[#717171]">
                      Attributes <span className="font-normal">(Color, Storage, Size...)</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => addAttribute(getVariantId(v))}
                      className="bg-[#222222] hover:bg-black text-white text-xs font-bold px-3.5 py-2 rounded-full inline-flex items-center gap-1 whitespace-nowrap shrink-0"
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
                        onChange={(e) => updateAttribute(getVariantId(v), a.attr_id, "attribute_name", e.target.value)}
                        className="w-full min-w-0 bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs text-[#222222]"
                      />
                      <input
                        type="text"
                        placeholder="Value (e.g. Black)"
                        value={a.attribute_value}
                        onChange={(e) => updateAttribute(getVariantId(v), a.attr_id, "attribute_value", e.target.value)}
                        className="w-full min-w-0 bg-white border border-[#DDDDDD] rounded-xl p-2.5 text-xs text-[#222222]"
                      />
                      <button
                        type="button"
                        onClick={() => removeAttribute(getVariantId(v), a.attr_id)}
                        className="p-2 text-[#717171] hover:text-[#FF385C] justify-self-end"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
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
