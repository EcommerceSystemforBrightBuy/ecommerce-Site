"use client";

import React from "react";
import {
  Truck,
  Store,
  CreditCard,
  Banknote,
  Clock,
  Warehouse,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function TexasDeliveryBanner({ selectedCity }) {
  return (
    <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 my-6 shadow-xl border border-slate-800 relative overflow-hidden">
      {/* Decorative Texas badge background */}
      <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-0 right-0 p-8 opacity-10 font-black text-8xl select-none">
        TX
      </div>

      <div className="relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold mb-3 border border-blue-400/30">
              <Warehouse className="w-3.5 h-3.5 text-blue-400" />
              Central Texas Warehouse Hub
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Texas Statewide Delivery & Store Pickup
            </h1>
            <p className="mt-1 text-sm text-slate-300 max-w-2xl leading-relaxed">
              BrightBuy operates a central warehouse in Texas guaranteeing rapid dispatch
              across all Texas municipalities with synchronized stock keeping.
            </p>
          </div>

          {/* Current destination highlight */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 lg:w-72 shrink-0">
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Selected Destination
            </div>
            <div className="text-lg font-bold text-white flex items-center justify-between mt-0.5">
              <span>{selectedCity.name}, Texas</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                  selectedCity.isMain
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                }`}
              >
                {selectedCity.isMain ? "Main Metro City" : "Regional City"}
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>
                Standard ETA:{" "}
                <strong className="text-white">
                  {selectedCity.isMain ? "5 Days" : "7 Days"}
                </strong>{" "}
                (In Stock)
              </span>
            </div>
          </div>
        </div>

        {/* Feature pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Texas City Logistics</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                <strong>5 days</strong> for Houston, Dallas, Austin, San Antonio & Fort Worth. <strong>7 days</strong> for all other cities.
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Stock Buffer Rule</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Out-of-stock items automatically add <strong>+3 business days</strong> to delivery for restock replenishment.
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Store Pickup Mode</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Collect within <strong>24 hours</strong> at any of our 5 Texas retail stores (Austin, Dallas, Houston, etc.).
              </div>
            </div>
          </div>

          <div className="bg-slate-800/60 rounded-xl p-3.5 border border-slate-700/60 flex items-start gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Dual Payment Support</div>
              <div className="text-[11px] text-slate-300 mt-0.5 leading-snug">
                Full support for <strong>Card Payment</strong> (Visa, MC, Amex) &amp; <strong>Cash on Delivery</strong> across Texas.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
