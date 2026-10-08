"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Truck,
  Store,
  Eye,
  X,
} from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_URL || "http://localhost:8000").replace(/\/$/, "");

const readOrders = async () => {
  const response = await fetch(`${API_URL}/api/orders`);
  if (!response.ok) throw new Error("Failed to fetch orders.");
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to fetch orders.");
  return result.data.map((order) => ({
    orderId: order.order_id,
    customerName: order.customer_name || order.customer_id,
    fulfillmentMode: order.delivery_mode,
    city: order.city_name || "",
    isMainCity: Boolean(order.is_main_city),
    estimatedDate: order.estimated_delivery_date
      ? new Date(order.estimated_delivery_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Not scheduled",
    status: order.delivery_status || "pending",
    skus: order.skus ? order.skus.split(",") : [],
  }));
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ordersError, setOrdersError] = useState("");
  const [updatingOrderId, setUpdatingOrderId] = useState(null);
  const [updateError, setUpdateError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [modeFilter, setModeFilter] = useState("all");
  const [viewOrderModal, setViewOrderModal] = useState(null);



  useEffect(() => {
    let active = true;
    readOrders()
      .then((data) => {
        if (active) setOrders(data);
      })
      .catch((error) => {
        console.error("Failed to fetch admin orders:", error);
        if (active) setOrdersError(error.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);


  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setLoading(true);
      setUpdateError("");
      setOrdersError("");
      const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Failed to update order status.");
      }
      setOrders(await readOrders());
    } catch (error) {
      console.error("Error updating status:", error);
      setUpdateError(error.message);
      setOrdersError(error.message);
    } finally {
      setLoading(false);
      setUpdatingOrderId(null);
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

      {updateError && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-900 font-bold">
          {updateError}
        </div>
      )}

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
              {loading ? (
                <tr><td colSpan="6" className="py-6 text-center text-[#717171]">Loading orders...</td></tr>
              ) : ordersError ? (
                <tr><td colSpan="6" className="py-6 text-center text-red-700">{ordersError}</td></tr>
              ) : filteredOrders.length === 0 ? (
                <tr><td colSpan="6" className="py-6 text-center text-[#717171]">No orders found.</td></tr>
              ) : filteredOrders.map((o) => (
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
                    <div className="font-bold text-[#222222]">{o.city ? `${o.city}, TX` : "Address not provided"}</div>
                    <div className="text-[10px] text-[#717171]">
                      {o.city ? (o.isMainCity ? "Main service city" : "Regional service city") : "No delivery city"}
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="font-bold text-emerald-700">{o.estimatedDate}</div>
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
                      <select
                        aria-label={`Dispatch status for order ${o.orderId}`}
                        value={["dispatched", "delivered", "failed"].includes(o.status.toLowerCase()) ? "dispatched" : "pending"}
                        disabled={updatingOrderId === o.orderId}
                        onChange={(event) => updateOrderStatus(o.orderId, event.target.value)}
                        className="px-2.5 py-1 rounded-lg border border-[#DDDDDD] bg-white text-[#222222] font-bold text-[10px] disabled:opacity-50"
                      >
                        <option value="pending">Not dispatched</option>
                        <option value="dispatched">Dispatched</option>
                      </select>
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

            <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] space-y-2">
              <div className="font-bold text-[#222222]">Items in this order</div>
              <div className="space-y-1 font-mono text-[11px]">
                {viewOrderModal.skus.length ? viewOrderModal.skus.map((sku) => (
                  <div key={sku} className="text-[#222222]">• {sku}</div>
                )) : <div className="text-[#717171]">No item SKUs found in the database.</div>}
              </div>
            </div>

            <div className="space-y-1 text-[#717171]">
              <div>Destination: <strong className="text-[#222222]">{viewOrderModal.city || "Not provided"}</strong></div>
              <div>Estimated Arrival: <strong className="text-[#FF385C]">{viewOrderModal.estimatedDate}</strong></div>
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
