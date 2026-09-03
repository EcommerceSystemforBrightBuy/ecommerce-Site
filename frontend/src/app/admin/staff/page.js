"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MOCK_STAFF } from "@/data/mockAdminData";
import {
  Users,
  UserPlus,
  Search,
  Eye,
  Edit,
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  Building2,
  Phone,
  Mail,
} from "lucide-react";

export default function AdminStaffPage() {
  const [staffList, setStaffList] = useState(MOCK_STAFF);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");

  // Modal States
  const [viewStaff, setViewStaff] = useState(null);
  const [deleteStaff, setDeleteStaff] = useState(null);
  const [actionSuccess, setActionSuccess] = useState("");

  const filteredStaff = staffList.filter((s) => {
    if (roleFilter !== "all" && !s.role.toLowerCase().includes(roleFilter.toLowerCase())) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = s.name.toLowerCase().includes(q);
      const matchesEmail = s.email.toLowerCase().includes(q);
      const matchesHub = s.hub.toLowerCase().includes(q);
      if (!matchesName && !matchesEmail && !matchesHub) return false;
    }
    return true;
  });

  const handleDeleteConfirm = () => {
    if (!deleteStaff) return;
    setStaffList((prev) => prev.filter((item) => item.id !== deleteStaff.id));
    setActionSuccess(`Staff member "${deleteStaff.name}" has been removed.`);
    setDeleteStaff(null);
    setTimeout(() => setActionSuccess(""), 3000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBEBEB] pb-5">
        <div>
          <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
            Human Resources &amp; Access Control
          </span>
          <h1 className="text-2xl font-black text-[#222222] mt-0.5">
            Staff Management
          </h1>
          <p className="text-xs text-[#717171] mt-0.5">
            Manage central warehouse directors, store hub managers, and logistics personnel.
          </p>
        </div>

        <Link
          href="/admin/staff/new"
          className="bg-[#FF385C] hover:bg-[#E00B41] text-white text-xs font-bold px-5 py-3 rounded-full transition-colors shadow-md inline-flex items-center gap-2 shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Onboard New Staff Member</span>
        </Link>
      </div>

      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-bold flex items-center justify-between animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess("")} className="text-emerald-700 font-bold">
            ×
          </button>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="border border-[#DDDDDD] rounded-2xl p-4 bg-white flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="w-4 h-4 text-[#717171] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search by staff name, email, or Texas hub..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#F7F7F7] border border-[#DDDDDD] rounded-full focus:outline-none focus:border-[#222222]"
          />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-[#F7F7F7] border border-[#DDDDDD] rounded-full px-4 py-2.5 font-bold text-[#222222] focus:outline-none"
          >
            <option value="all">All Roles</option>
            <option value="director">Central WH Directors</option>
            <option value="manager">Store Managers</option>
            <option value="logistics">Logistics Leads</option>
            <option value="inventory">Inventory Specialists</option>
          </select>
        </div>
      </div>

      {/* Staff Data Table */}
      <div className="border border-[#DDDDDD] rounded-3xl bg-white overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F7F7F7] border-b border-[#EBEBEB] text-[#717171] font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-4 px-6">Staff Member</th>
                <th className="py-4 px-4">Role Title</th>
                <th className="py-4 px-4">Assigned Hub / Store Branch</th>
                <th className="py-4 px-4">Phone &amp; Contact</th>
                <th className="py-4 px-4">Status</th>
                <th className="py-4 px-6 text-right">Actions (View / Edit / Delete)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EBEBEB]">
              {filteredStaff.map((s) => (
                <tr key={s.id} className="hover:bg-[#F7F7F7] transition-colors">
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={s.avatar}
                        alt={s.name}
                        className="w-10 h-10 rounded-full object-cover border border-[#DDDDDD] shrink-0"
                      />
                      <div>
                        <div className="font-bold text-[#222222] text-sm">{s.name}</div>
                        <div className="text-[11px] text-[#717171] font-mono">{s.email}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-bold text-[#222222]">
                    {s.role}
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-1.5 text-[#222222]">
                      <Building2 className="w-3.5 h-3.5 text-[#FF385C]" />
                      <span>{s.hub}</span>
                    </div>
                  </td>

                  <td className="py-4 px-4 font-mono text-[#717171]">
                    {s.phone}
                  </td>

                  <td className="py-4 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 font-bold text-[10px]">
                      {s.status}
                    </span>
                  </td>

                  <td className="py-4 px-6 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setViewStaff(s)}
                        className="p-2 rounded-xl hover:bg-[#EBEBEB] text-[#717171] hover:text-[#222222]"
                        title="View Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <Link
                        href={`/admin/staff/${s.id}/edit`}
                        className="p-2 rounded-xl hover:bg-[#EBEBEB] text-[#717171] hover:text-[#222222]"
                        title="Edit Staff Member"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => setDeleteStaff(s)}
                        className="p-2 rounded-xl hover:bg-rose-50 text-[#717171] hover:text-[#FF385C]"
                        title="Delete Staff Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VIEW STAFF MODAL */}
      {viewStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DDDDDD] shadow-2xl animate-in zoom-in-95 duration-150 text-xs">
            <div className="flex items-center justify-between border-b border-[#EBEBEB] pb-3">
              <span className="text-xs font-bold text-[#FF385C] uppercase">
                Staff Profile
              </span>
              <button
                onClick={() => setViewStaff(null)}
                className="p-1 rounded-full hover:bg-[#F7F7F7] text-[#717171]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4">
              <img
                src={viewStaff.avatar}
                alt={viewStaff.name}
                className="w-16 h-16 rounded-full object-cover border border-[#DDDDDD]"
              />
              <div>
                <div className="font-black text-lg text-[#222222]">{viewStaff.name}</div>
                <div className="text-xs font-bold text-[#FF385C]">{viewStaff.role}</div>
                <div className="text-[11px] text-[#717171]">Joined {viewStaff.joinDate}</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#F7F7F7] border border-[#DDDDDD] space-y-2">
              <div className="flex items-center gap-2 text-[#222222]">
                <Building2 className="w-4 h-4 text-[#FF385C]" />
                <span className="font-bold">Assigned Location: {viewStaff.hub}</span>
              </div>
              <div className="flex items-center gap-2 text-[#717171]">
                <Mail className="w-4 h-4" />
                <span>{viewStaff.email}</span>
              </div>
              <div className="flex items-center gap-2 text-[#717171]">
                <Phone className="w-4 h-4" />
                <span>{viewStaff.phone}</span>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setViewStaff(null)}
                className="bg-[#222222] text-white font-bold px-5 py-2.5 rounded-full"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE STAFF MODAL */}
      {deleteStaff && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 border border-[#DDDDDD] shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-[#FF385C] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-[#222222]">Remove Staff Personnel?</h3>
              <p className="text-xs text-[#717171]">
                Are you sure you want to remove <strong>"{deleteStaff.name}"</strong> ({deleteStaff.role}) from the BrightBuy Texas staff directory?
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeleteStaff(null)}
                className="flex-1 py-3 border border-[#DDDDDD] text-[#222222] font-bold text-xs rounded-xl hover:bg-[#F7F7F7]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="flex-1 py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white font-bold text-xs rounded-xl shadow-md"
              >
                Yes, Remove Staff
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
