"use client";

import React from "react";
import {
  X,
  Trash2,
  Minus,
  Plus,
  ArrowRight,
  ShoppingBag,
  ShieldCheck,
  AlertTriangle,
  Lock,
  Warehouse,
  Truck,
} from "lucide-react";

export default function CartDrawer({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onProceedToCheckout,
  currentUser,
  onOpenAuth,
}) {
  if (!isOpen) return null;

  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.variant.price * item.quantity,
    0
  );
  // Texas state sales tax is 8.25%
  const salesTax = subtotal * 0.0825;
  const grandTotal = subtotal + salesTax;

  const hasOutOfStockItem = cartItems.some((item) => item.variant.stock <= 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Your Cart</h2>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
              </span>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Your cart is empty</h3>
                <p className="text-xs text-slate-600 mt-1 max-w-xs">
                  Explore our Texas electronics and smart robotics catalog to add items.
                </p>
                <button
                  type="button"
                  onClick={onClose}
                  className="mt-5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 shadow-sm"
                >
                  Start Shopping
                </button>
              </div>
            ) : (
              <>
                {/* Out of stock banner if any */}
                {hasOutOfStockItem && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Texas Inventory Notice:</span> One or more items in
                      your cart are currently restocking at our Texas warehouse. +3 business days
                      will be added to your estimated delivery date.
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  {cartItems.map((item) => {
                    const isBackorder = item.variant.stock <= 0;
                    return (
                      <div
                        key={`${item.product.id}-${item.variant.id}`}
                        className="p-3.5 rounded-2xl border border-slate-200/90 bg-white hover:border-slate-300 transition-colors flex gap-3 relative"
                      >
                        {/* Thumbnail */}
                        <img
                          src={item.product.image}
                          alt={item.product.name}
                          className="w-18 h-18 rounded-xl object-cover bg-slate-100 border border-slate-100 shrink-0"
                        />

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-1">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {item.product.name}
                            </h4>
                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.product.id, item.variant.id)}
                              className="text-slate-400 hover:text-red-600 p-1 transition-colors"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-[11px] text-slate-600 mt-0.5">
                            Variant:{" "}
                            <span className="font-semibold text-slate-800">
                              {item.variant.name}
                            </span>
                          </div>

                          {/* SKU badge */}
                          <div className="text-[10px] font-mono text-slate-600 flex items-center gap-1 mt-0.5">
                            <span>SKU:</span>
                            <span className="bg-slate-100 px-1 py-0.2 rounded font-medium">
                              {item.variant.sku}
                            </span>
                          </div>

                          {/* Stock status */}
                          <div className="mt-1">
                            {isBackorder ? (
                              <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                Restocking (+3d ETA)
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                In Stock
                              </span>
                            )}
                          </div>

                          {/* Price & Quantity stepper */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            <div className="text-xs font-bold text-slate-900">
                              ${(item.variant.price * item.quantity).toFixed(2)}
                            </div>

                            <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.product.id,
                                    item.variant.id,
                                    item.quantity - 1
                                  )
                                }
                                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-l-lg transition-colors"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-bold text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(
                                    item.product.id,
                                    item.variant.id,
                                    item.quantity + 1
                                  )
                                }
                                className="p-1 text-slate-600 hover:text-slate-900 hover:bg-white rounded-r-lg transition-colors"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Footer & Checkout Action */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              {/* Order Calculations */}
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-900">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated Texas Sales Tax (8.25%)</span>
                  <span className="font-semibold text-slate-900">${salesTax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery & Pickup</span>
                  <span className="font-semibold text-emerald-600">Calculated at Checkout</span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Estimated Total</span>
                  <span className="text-blue-600">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Customer Registration Validation Notice as per business rules:
                  "Users can browse as guests or register as customers. Only registered customers can check out their cart and place an order." */}
              {!currentUser ? (
                <div className="p-3 bg-blue-50/80 border border-blue-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                    <Lock className="w-3.5 h-3.5 text-blue-700" />
                    Customer Registration Required
                  </div>
                  <p className="text-[11px] text-blue-800 leading-snug">
                    Per BrightBuy Texas policy, you are currently browsing as a Guest. Please register
                    or sign in to finalize checkout and lock in warehouse inventory.
                  </p>
                  <button
                    type="button"
                    onClick={onOpenAuth}
                    className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                  >
                    Sign In or Register (1-Click Demo)
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-medium">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                    Verified Customer: <strong className="text-slate-900">{currentUser.name}</strong>
                  </div>
                  <button
                    type="button"
                    onClick={onProceedToCheckout}
                    className="w-full py-3 px-4 bg-slate-900 hover:bg-blue-600 active:scale-[0.99] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md"
                  >
                    <span>Proceed to Texas Checkout</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
