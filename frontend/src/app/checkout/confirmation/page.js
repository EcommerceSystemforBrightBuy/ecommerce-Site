"use client";

import React from "react";
import Link from "next/link";
import { useShop } from "@/context/ShopContext";
import { STORE_PICKUP_LOCATIONS } from "@/data/mockData";
import {
  CheckCircle2,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Warehouse,
  ArrowRight,
  Printer,
} from "lucide-react";

export default function OrderConfirmationPage() {
  const { lastOrder } = useShop();

  const singleStore = STORE_PICKUP_LOCATIONS[0];

  const order = lastOrder || {
    orderId: "BB-TX-2026-881294",
    date: new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }),
    customer: { name: "David Martinez", email: "david.m@austinmail.com" },
    deliveryMode: "standard",
    paymentMethod: "card",
    shippingCity: "Austin",
    streetAddress: "4500 Tech Ridge Blvd, Suite 200",
    totalDue: 1424.42,
    estimatedArrival: "In 5 Business Days",
    items: [
      {
        product: { name: "ApexPro 16 5G Smartphone" },
        variant: { name: "Space Black / 256GB", sku: "WH-APX-16-BLK-256", price: 999.0 },
        quantity: 1,
      },
      {
        product: { name: "AuraWave ANC Wireless Headphones" },
        variant: { name: "Midnight Carbon", sku: "WH-SND-AWANC-MBLK", price: 349.0 },
        quantity: 1,
      },
    ],
  };

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-8 py-12 space-y-8">
      {/* Success Badge */}
      <div className="border border-[#DDDDDD] rounded-3xl p-8 text-center space-y-3 bg-white shadow-sm">
        <div className="w-14 h-14 bg-[#FF385C] text-white rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-black text-[#222222]">Order Confirmed &amp; Reserved</h1>
        <p className="text-xs text-[#717171] max-w-md mx-auto">
          Your order is securely registered in BrightBuy Texas database. Central warehouse stock
          has been atomically decremented.
        </p>
        <div className="inline-block mt-2 px-4 py-1.5 bg-[#F7F7F7] font-mono text-xs font-bold text-[#222222] border border-[#DDDDDD] rounded-full">
          Order ID: {order.orderId}
        </div>
      </div>

      {/* Fulfillment Status Card */}
      <div className="border border-[#DDDDDD] rounded-3xl p-6 space-y-4 text-xs bg-white">
        <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
          <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
            {order.deliveryMode === "pickup" ? (
              <Store className="w-4 h-4 text-[#FF385C]" />
            ) : (
              <Truck className="w-4 h-4 text-[#FF385C]" />
            )}
            <span>
              {order.deliveryMode === "pickup"
                ? "Central Store Pickup Counter"
                : "Standard Texas Ground Delivery"}
            </span>
          </div>
          <span className="font-bold bg-emerald-100 text-emerald-900 px-3 py-1 rounded-full text-[10px]">
            Status: Queued for Dispatch
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <div className="text-[#717171] text-[11px] font-bold uppercase">
              {order.deliveryMode === "pickup" ? "Pickup Store Location" : "Delivery Destination"}
            </div>
            <div className="font-bold text-[#222222] text-sm mt-0.5">
              {order.deliveryMode === "pickup"
                ? singleStore.name
                : `${order.shippingCity}, Texas`}
            </div>
            <div className="text-[#717171] text-xs mt-0.5">
              {order.deliveryMode === "pickup"
                ? singleStore.address
                : `${order.streetAddress}`}
            </div>
          </div>

          <div>
            <div className="text-[#717171] text-[11px] font-bold uppercase">Estimated Timeline</div>
            <div className="font-bold text-[#FF385C] text-sm mt-0.5">
              {order.estimatedArrival}
            </div>
            <div className="text-[#717171] text-xs mt-0.5">
              {order.deliveryMode === "pickup"
                ? "Ready in 24 hours at Central Store counter"
                : "Dispatched from Central Warehouse in Austin"}
            </div>
          </div>
        </div>
      </div>

      {/* Payment and Customer Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
        <div className="border border-[#DDDDDD] rounded-2xl p-5 space-y-1 bg-white">
          <div className="text-[#717171] text-[11px] font-bold uppercase">Payment Method</div>
          <div className="font-bold text-[#222222] flex items-center gap-1.5">
            {order.paymentMethod === "card" ? (
              <>
                <CreditCard className="w-3.5 h-3.5 text-[#FF385C]" /> Card Payment (Paid Online)
              </>
            ) : (
              <>
                <Banknote className="w-3.5 h-3.5 text-[#FF385C]" /> Cash on Delivery (Pay at Arrival)
              </>
            )}
          </div>
          <div className="text-[#222222] font-bold text-xs pt-1">
            Total Paid: ${order.totalDue?.toFixed(2) || "0.00"}
          </div>
        </div>

        <div className="border border-[#DDDDDD] rounded-2xl p-5 space-y-1 bg-white">
          <div className="text-[#717171] text-[11px] font-bold uppercase">Customer Account</div>
          <div className="font-bold text-[#222222]">{order.customer?.name || "Customer"}</div>
          <div className="text-[#717171] text-xs">
            {order.customer?.email || "customer@brightbuy.tx"}
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="border border-[#DDDDDD] rounded-3xl p-6 space-y-3 text-xs bg-white">
        <div className="font-bold text-[#222222] uppercase text-[11px] border-b border-[#EBEBEB] pb-2">
          Purchased Items &amp; Warehouse SKU Mapping
        </div>
        <div className="divide-y divide-[#EBEBEB]">
          {order.items?.map((item, idx) => (
            <div key={idx} className="py-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-[#222222]">{item.product.name}</span>
                <div className="text-xs text-[#717171]">
                  {item.variant.name} • SKU: {item.variant.sku} × {item.quantity}
                </div>
              </div>
              <span className="font-bold text-[#222222]">
                ${(item.variant.price * item.quantity).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-[#EBEBEB]">
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 text-xs font-bold text-[#222222] hover:underline"
        >
          <Printer className="w-4 h-4" />
          <span>Print Receipt</span>
        </button>

        <Link
          href="/products"
          className="py-3 px-6 bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold rounded-full flex items-center gap-2 transition-colors shadow-md"
        >
          <span>Continue Shopping</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </main>
  );
}
