"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { UPCOMING_DELIVERY_ESTIMATES } from "@/data/mockAdminData";
import {
  ShoppingBag,
  Search,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Eye,
  CheckCircle2,
  Clock,
  Warehouse,
  X,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [viewOrderModal, setViewOrderModal] = useState(null);



  //fetch orders
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/api/orders");
      const result = await res.json();
      if (result.success) {
        // Map database fields to UI property names
        const mappedOrders = result.data.map((o) => ({
          orderId: o.order_id,
          customerName: o.customer_id || "CUST001",
          fulfillmentMode: o.delivery_mode || "Standard Delivery",
          city: "Texas",
          estimatedDate: o.estimated_delivery_date
            ? new Date(o.estimated_delivery_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "5-7 Days",
          status: o.delivery_status || o.order_status || "pending",
          totalAmount: o.total_amount,
          paymentMethod: o.payment_method || "Card Payment",
          skus: ["SKU-VAR001"], // Default fallback SKU list
          carrier: "Texas Regional Express",
          estArrivalDate: o.estimated_delivery_date
            ? new Date(o.estimated_delivery_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
            : "5-7 Days"
        }));
        setOrders(mappedOrders);
      }
    } catch (error) {
      console.error("Failed to fetch admin orders:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, []);


  // update order status
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const res = await fetch(`http://localhost:8000/api/orders/${orderId}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await res.json();
      if (result.success) {
        // Update local state UI
        setOrders((prev) =>
          prev.map((o) => (o.orderId === orderId ? { ...o, status: newStatus } : o))
        );
      } else {
        alert("Failed to update status: " + result.error);
      }
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Server error connecting to backend API.");
    }
  };



  const filteredOrders = orders.filter((o) => {
    if (modeFilter === "standard" && o.fulfillmentMode !== "Standard Delivery") return false;
    if (modeFilter === "pickup" && o.fulfillmentMode !== "Store Pickup") return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesId = o.orderId.toLowerCase().includes(q);
      const matchesCustomer = o.customerName.toLowerCase().includes(q);
      const matchesCity = o.city.toLowerCase().includes(q);
      if (!matchesId && !matchesCustomer && !matchesCity) return false;
    }
    return true;
  });


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-5">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            Order Fulfillment &amp; Dispatch
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Texas Orders Processing
          </h1>
          <p className="text-xs text-[#717171] mt-0.5">
            Manage customer orders, Texas courier dispatch, and store pickup readiness.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="border border-[#DDDDDD] rounded-2xl p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#717171] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search Order ID, customer, or Texas city..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F7F7] border border-[#DDDDDD] rounded-full text-xs text-[#222222] focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={modeFilter}
            onChange={(e) => setModeFilter(e.target.value)}
            className="bg-[#F7F7F7] border border-[#DDDDDD] rounded-full px-4 py-2 font-bold text-[#222222] focus:outline-none"
          >
            <option value="all">All Fulfillment Modes</option>
            <option value="standard">Standard Texas Delivery</option>
            <option value="pickup">Store Pickup (24h)</option>
          </select>
        </div>
      </div>

      {/* Orders Data Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Order ID &amp; Customer</th>
                <th className="py-4 px-4">Fulfillment Mode</th>
                <th className="py-4 px-4">Texas Destination</th>
                <th className="py-4 px-4">Delivery Timeline</th>
                <th className="py-4 px-4">Status Badge</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {filteredOrders.map((o) => (
                <tr key={o.orderId} className="hover:bg-[#F7F7F7] transition-colors">
                  <td className="py-4 px-6 font-mono">
                    <div className="font-bold text-[#222222] text-sm">{o.orderId}</div>
                    <div className="text-xs text-[#717171]">{o.customerName}</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 font-bold text-[#222222]">
                      {o.fulfillmentMode === "Store Pickup" ? (
                        <Store className="w-4 h-4 text-[#FF385C]" />
                      ) : (
                        <Truck className="w-4 h-4 text-[#FF385C]" />
                      )}
                      <span>{o.fulfillmentMode}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-[#222222]">{o.city}, TX</div>
                    <div className="text-[10px] text-[#717171]">
                      {o.isMainCity ? "5-Day Metro City" : "7-Day Regional Transit"}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-emerald-700">{o.estArrivalDate}</div>
                    <div className="text-[10px] text-[#717171]">{o.totalEstDays} Days total</div>
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-3 py-1 rounded-full bg-[#F7F7F7] text-[#222222] border border-[#DDDDDD] font-bold text-[10px]">
                      {o.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewOrderModal(o)}
                        className="p-2 rounded-xl hover:bg-[#EBEBEB] text-[#717171] hover:text-[#222222]"
                        title="View Dispatch Sheet"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateOrderStatus(o.orderId, "Dispatched")}
                        className="px-2.5 py-1 rounded-lg bg-[#222222] text-white font-bold text-[10px]"
                      >
                        Dispatch
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPATCH SHEET MODAL */}
      {viewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 border border-[#DDDDDD] shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
              <span className="text-xs font-bold text-[#FF385C] uppercase">
                Order Dispatch Sheet
              </span>
              <button
                onClick={() => setViewOrderModal(null)}
                className="p-1 rounded-full hover:bg-[#F7F7F7] text-[#717171]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1 font-mono text-[11px]">
              {(viewOrderModal.skus || []).map((s, idx) => (
                <div key={idx} className="flex justify-between text-[#222222]">
                  <span>• {s}</span>
                  <span className="text-emerald-700 font-bold">Decremented Atomic DB</span>
                </div>
              ))}
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] space-y-2">
              <div className="font-bold text-[#222222]">Mapped Warehouse SKUs</div>
              <div className="space-y-1 font-mono text-[11px]">
                {viewOrderModal.skus.map((s, idx) => (
                  <div key={idx} className="flex justify-between text-[#222222]">
                    <span>• {s}</span>
                    <span className="text-emerald-700 font-bold">Decremented Atomic DB</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-1 text-[#717171]">
              <div>Courier Carrier: <strong className="text-[#222222]">{viewOrderModal.carrier}</strong></div>
              <div>Estimated Arrival: <strong className="text-[#FF385C]">{viewOrderModal.estArrivalDate}</strong></div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewOrderModal(null)}
                className="bg-[#222222] text-white font-bold px-5 py-2.5 rounded-full"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
