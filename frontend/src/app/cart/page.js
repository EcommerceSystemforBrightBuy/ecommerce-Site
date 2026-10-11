"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import {
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  Lock,
  Warehouse,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function CartPage() {
  const router = useRouter();
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    cartSubtotal,
    texasSalesTax,
    currentUser,
    selectedCity,
  } = useShop();

  const total = cartSubtotal;
  const hasOutOfStock = cartItems.some((i) => (i.variant?.stock ?? 0) <= 0);

  const handleProceed = () => {
    if (!currentUser) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="border-b border-[#EBEBEB] pb-6 flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            Shopping Cart
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#222222] mt-0.5">
            Your Order Items
          </h1>
        </div>
        <div className="text-xs font-semibold text-[#717171] bg-[#F7F7F7] px-3 py-1.5 rounded-full border border-[#DDDDDD]">
          Destination: {selectedCity.name}, TX
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="py-20 text-center border border-[#DDDDDD] rounded-3xl p-8 bg-[#F7F7F7] space-y-4">
          <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-[#717171] mx-auto border border-[#DDDDDD]">
            <ShoppingBag className="w-8 h-8 text-[#FF385C]" />
          </div>
          <h2 className="text-base font-bold text-[#222222]">Your cart is currently empty</h2>
          <p className="text-xs text-[#717171] max-w-sm mx-auto">
            Explore our Texas catalogue of consumer electronics and STEM toys to add items.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="bg-[#222222] hover:bg-black text-white text-xs font-bold px-6 py-3 rounded-full inline-flex items-center gap-2"
            >
              <span>Explore Products</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Backorder restock warning if any */}
          {hasOutOfStock && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1 text-amber-900 flex items-start gap-3">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Restocking Notice:</span> One or more items in your cart
                are on backorder at the Central Texas Warehouse. +3 business days will be added to the
                delivery timeline.
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="space-y-4">
            {cartItems.map((item) => {
              const isBackorder = item.variant.stock <= 0;
              return (
                <div
                  key={`${item.product.id}-${item.variant.id}`}
                  className="border border-[#DDDDDD] rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-20 h-20 object-cover bg-[#F7F7F7] rounded-xl border border-[#EBEBEB] shrink-0"
                    />
                    <div className="space-y-1">
                      <Link
                        href={`/products/${item.product.id}`}
                        className="font-bold text-sm text-[#222222] hover:underline line-clamp-1"
                      >
                        {item.product.name}
                      </Link>
                      <div className="text-xs text-[#717171]">
                        Variant: <span className="font-semibold text-[#222222]">{item.variant.name}</span>
                      </div>
                      <div className="text-[11px] font-mono text-[#717171]">
                        SKU: {item.variant.sku}
                      </div>
                      <div className="pt-1">
                        {isBackorder ? (
                          <span className="text-[10px] font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                            Restocking (+3d)
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold bg-emerald-100 text-emerald-900 px-2.5 py-0.5 rounded-full">
                            In Stock ({item.variant.stock} available)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Quantity and Price */}
                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0">
                    <div className="flex items-center border border-[#DDDDDD] rounded-full p-1 bg-[#F7F7F7]">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.variant.id, item.quantity - 1)
                        }
                        className="w-7 h-7 rounded-full bg-white text-[#222222] flex items-center justify-center font-bold shadow-2xs"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-mono font-bold text-[#222222]">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(item.product.id, item.variant.id, item.quantity + 1)
                        }
                        className="w-7 h-7 rounded-full bg-white text-[#222222] flex items-center justify-center font-bold shadow-2xs"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right min-w-[90px]">
                      <div className="text-base font-black text-[#222222]">
                        ${(item.variant.price * item.quantity).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-[#717171]">
                        ${item.variant.price.toFixed(2)} ea
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id, item.variant.id)}
                      className="text-[#717171] hover:text-[#FF385C] p-1 transition-colors"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pricing Totals & Customer Authorization Box */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
            {/* Customer Requirement Notice */}
            <div className="border border-[#DDDDDD] rounded-2xl p-6 space-y-3 bg-[#F7F7F7] text-xs">
              <div className="font-bold text-[#222222] text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-[#FF385C]" />
                <span>Customer Registration Required</span>
              </div>
              <p className="text-[#717171] text-xs leading-relaxed">
                Under BrightBuy Texas platform policy, guests can browse and configure items, but
                placing an order requires a registered customer account for atomic warehouse inventory
                reservations.
              </p>
              {currentUser ? (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Verified: {currentUser.name} ({currentUser.email})</span>
                  </div>
                  <p className="text-[11px] text-[#717171]">
                    Your cart is saved to your account, so it will be here next time you sign in.
                  </p>
                </div>
              ) : (
                <div className="pt-2 space-y-1">
                  <Link
                    href="/login?redirect=/checkout"
                    className="inline-block text-xs font-bold text-[#FF385C] underline hover:text-[#E00B41]"
                  >
                    Sign In or Register Account &rarr;
                  </Link>
                  <p className="text-[11px] text-[#717171]">
                    Items in this cart will be merged into your saved cart when you sign in.
                  </p>
                </div>
              )}
            </div>

            {/* Totals & Checkout Button */}
            <div className="border border-[#DDDDDD] rounded-2xl p-6 space-y-3.5 text-xs bg-white shadow-sm">
              <div className="flex justify-between text-[#717171]">
                <span>Subtotal</span>
                <span className="font-semibold text-[#222222]">${cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#717171]">
                <span>Delivery or Store Pickup</span>
                <span className="text-[#222222] font-medium">Calculated at checkout</span>
              </div>

              <div className="pt-3 border-t border-[#EBEBEB] flex justify-between items-baseline">
                <span className="font-bold text-[#222222] text-sm">Estimated Total</span>
                <span className="text-2xl font-black text-[#222222]">
                  ${total.toFixed(2)}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleProceed}
                  className="w-full py-3.5 px-4 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold rounded-xl transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>
                    {currentUser
                      ? "Proceed to Delivery & Address Details"
                      : "Sign In as Customer to Checkout"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
