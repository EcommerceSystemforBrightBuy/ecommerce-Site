"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Truck,
  Store,
  Eye,
  X,
  AlertCircle,
  CheckCircle2,
  Package,
} from "lucide-react";

const API_URL = (process.env.NEXT_PUBLIC_URL || "http://localhost:8000").replace(/\/$/, "");

const readOrders = async () => {
  const response = await fetch(`${API_URL}/api/orders`);
  if (!response.ok) throw new Error("Failed to fetch orders.");
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to fetch orders.");
  return result.data.map((order) => ({
    orderId: order.order_id,
    customerId: order.customer_id,
    customerName: order.customer_name || order.customer_id,
    customerEmail: order.customer_email || "",
    fulfillmentMode: order.delivery_mode,
    city: order.city_name || "",
    addressLine: order.address_line || "",
    postalCode: order.postal_code || "",
    isMainCity: Boolean(order.is_main_city),
    estimatedDate: order.estimated_delivery_date
      ? new Date(order.estimated_delivery_date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : "Not scheduled",
    status: order.delivery_status || "pending",
    totalAmount: order.total_amount ? parseFloat(order.total_amount) : 0,
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
  const [modalLoading, setModalLoading] = useState(false);

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

  const openOrderDetails = async (orderId) => {
    setModalLoading(true);
    setViewOrderModal({ loading: true, orderId });
    try {
      const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderId)}`);
      if (!response.ok) throw new Error("Failed to fetch order details.");
      const data = await response.json();
      if (!data.success) throw new Error(data.message || "Order details not found.");
      setViewOrderModal({
        loading: false,
        order: data.order,
        items: data.items || []
      });
    } catch (err) {
      console.error("Error fetching order details:", err);
      setViewOrderModal({
        loading: false,
        error: err.message,
        orderId
      });
    } finally {
      setModalLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrderId(orderId);
      setUpdateError("");
      setOrdersError("");
      const response = await fetch(`${API_URL}/api/orders/${encodeURIComponent(orderId)}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || result.message || "Failed to update order status.");
      }
      setOrders(await readOrders());
    } catch (error) {
      console.error("Error updating status:", error);
      setUpdateError(error.message);
    } finally {
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
        <div role="alert" className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 font-bold flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <div className="text-sm font-black">Dispatch Blocked by Inventory Constraint</div>
            <div>{updateError}</div>
          </div>
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
                <th className="py-4 px-4">Total Amount</th>
                <th className="py-4 px-4">Status</th>
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
                    <div className="text-xs text-[#717171] font-sans font-semibold">{o.customerName} ({o.customerId})</div>
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
                    <div className="font-bold text-[#222222]">
                      {o.addressLine
                        ? `${o.addressLine}, ${o.city || "TX"} ${o.postalCode || ""}`
                        : o.city
                        ? `${o.city}, TX`
                        : "Central Hub Pickup"}
                    </div>
                    <div className="text-[10px] text-[#717171]">
                      ETA: {o.estimatedDate}
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-[#222222] text-sm">
                    ${o.totalAmount.toFixed(2)}
                  </td>

                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full font-bold text-[10px] uppercase border ${
                      o.status.toLowerCase() === "dispatched" || o.status.toLowerCase() === "shipped"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-300"
                        : "bg-amber-50 text-amber-800 border-amber-300"
                    }`}>
                      {o.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => openOrderDetails(o.orderId)}
                        className="px-3 py-1.5 rounded-xl bg-[#F7F7F7] hover:bg-[#EBEBEB] text-[#222222] font-bold text-xs flex items-center gap-1.5 transition-colors border border-[#DDDDDD]"
                        title="View Full Order Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </button>
                      <select
                        aria-label={`Dispatch status for order ${o.orderId}`}
                        value={["dispatched", "delivered", "shipped", "failed"].includes(o.status.toLowerCase()) ? "dispatched" : "pending"}
                        disabled={updatingOrderId === o.orderId}
                        onChange={(event) => updateOrderStatus(o.orderId, event.target.value)}
                        className="px-2.5 py-1.5 rounded-xl border border-[#DDDDDD] bg-white text-[#222222] font-bold text-xs disabled:opacity-50 hover:border-[#222222]"
                      >
                        <option value="pending">Not Dispatched</option>
                        <option value="dispatched">Dispatch Order</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* FULL ORDER DETAILS DISPATCH MODAL */}
      {viewOrderModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 border border-[#DDDDDD] shadow-2xl animate-in zoom-in-95 duration-150 text-xs my-8">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-4">
              <div>
                <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
                  Order Dispatch Sheet &amp; Details
                </span>
                <h2 className="text-xl font-black text-[#222222] font-mono mt-0.5">
                  {viewOrderModal.orderId || viewOrderModal.order?.order_id}
                </h2>
              </div>
              <button
                onClick={() => setViewOrderModal(null)}
                className="p-2 rounded-full hover:bg-[#F7F7F7] text-[#717171]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {viewOrderModal.loading ? (
              <div className="py-12 text-center text-[#717171] space-y-2">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#222222]/20 border-t-[#222222] mx-auto" />
                <div>Fetching complete order items and customer information...</div>
              </div>
            ) : viewOrderModal.error ? (
              <div className="p-4 rounded-2xl bg-red-50 text-red-900 font-bold border border-red-200">
                {viewOrderModal.error}
              </div>
            ) : (
              <div className="space-y-6">
                {/* Customer & Delivery Summary Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] space-y-1.5">
                    <div className="font-bold text-[#222222] text-xs uppercase text-[#717171]">Customer Profile</div>
                    <div className="font-black text-sm text-[#222222]">
                      {viewOrderModal.order.customer_name || viewOrderModal.order.customer_id}
                    </div>
                    <div className="text-[#717171]">ID: <strong className="text-[#222222]">{viewOrderModal.order.customer_id}</strong></div>
                    {viewOrderModal.order.customer_email && (
                      <div className="text-[#717171]">Email: <span className="font-mono text-[#222222]">{viewOrderModal.order.customer_email}</span></div>
                    )}
                    {viewOrderModal.order.customer_phone && (
                      <div className="text-[#717171]">Phone: <span className="text-[#222222] font-semibold">{viewOrderModal.order.customer_phone}</span></div>
                    )}
                  </div>

                  <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] space-y-1.5">
                    <div className="font-bold text-[#222222] text-xs uppercase text-[#717171]">Fulfillment &amp; Payment</div>
                    <div className="font-bold text-[#222222]">Mode: {viewOrderModal.order.delivery_mode}</div>
                    <div className="text-[#717171]">
                      Address:{" "}
                      <strong className="text-[#222222]">
                        {viewOrderModal.order.address_line
                          ? `${viewOrderModal.order.address_line}, ${viewOrderModal.order.city_name || "TX"} ${viewOrderModal.order.postal_code || ""}`
                          : viewOrderModal.order.city_name
                          ? `${viewOrderModal.order.city_name}, TX`
                          : "Central Store Pickup"}
                      </strong>
                    </div>
                    <div className="text-[#717171]">Payment Method: <strong className="text-[#222222]">{viewOrderModal.order.payment_method}</strong> ({viewOrderModal.order.payment_status || "completed"})</div>
                    <div className="text-[#717171]">Delivery Status: <strong className="text-[#FF385C] uppercase">{viewOrderModal.order.delivery_status}</strong></div>
                  </div>
                </div>

                {/* Itemized Order Products Table */}
                <div className="space-y-2">
                  <div className="font-bold text-[#222222] text-sm flex items-center justify-between">
                    <span>Ordered Items ({viewOrderModal.items.length})</span>
                    <span className="text-xs text-[#717171]">Total: ${parseFloat(viewOrderModal.order.total_amount).toFixed(2)}</span>
                  </div>

                  <div className="border border-[#DDDDDD] rounded-2xl overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold text-[10px] uppercase">
                        <tr>
                          <th className="py-3 px-4">Product &amp; Brand</th>
                          <th className="py-3 px-3">Variant / SKU</th>
                          <th className="py-3 px-3 text-center">Qty</th>
                          <th className="py-3 px-3 text-right">Unit Price</th>
                          <th className="py-3 px-4 text-right">Subtotal</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EBEBEB]">
                        {viewOrderModal.items.map((item, idx) => {
                          const subtotal = Number(item.subtotal) || (Number(item.quantity) * Number(item.unit_price));
                          return (
                            <tr key={item.order_item_id || idx} className="hover:bg-[#F7F7F7]">
                              <td className="py-3 px-4">
                                <div className="font-bold text-[#222222]">{item.product_name}</div>
                                <div className="text-[10px] text-[#717171]">{item.brand}</div>
                              </td>
                              <td className="py-3 px-3 font-mono text-[11px]">
                                <div>{item.variant_name}</div>
                                <div className="text-[10px] text-[#717171]">{item.sku}</div>
                              </td>
                              <td className="py-3 px-3 text-center font-bold text-[#222222]">
                                {item.quantity}
                              </td>
                              <td className="py-3 px-3 text-right font-mono text-[#222222]">
                                ${Number(item.unit_price).toFixed(2)}
                              </td>
                              <td className="py-3 px-4 text-right font-extrabold text-[#222222]">
                                ${subtotal.toFixed(2)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-2 flex items-center justify-between border-t border-[#EBEBEB]">
                  <div className="font-black text-lg text-[#222222]">
                    Total: ${parseFloat(viewOrderModal.order.total_amount).toFixed(2)}
                  </div>
                  <button
                    onClick={() => setViewOrderModal(null)}
                    className="bg-[#222222] hover:bg-black text-white font-bold px-6 py-2.5 rounded-full transition-colors"
                  >
                    Close Sheet
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
