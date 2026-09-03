"use client";

import React from "react";
import Link from "next/link";
import { Globe, Store, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[#EBEBEB] bg-[#F7F7F7] text-[#222222] mt-20 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-[#DDDDDD]">
          <div>
            <h4 className="font-bold text-[#222222] mb-3 text-xs">BrightBuy Texas Hub</h4>
            <ul className="space-y-2 text-[#717171]">
              <li>Central Texas Store &amp; Warehouse</li>
              <li>4500 Tech Ridge Blvd, Suite 100</li>
              <li>Austin, Texas 78753</li>
              <li>Phone: (512) 555-0100</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#222222] mb-3 text-xs">Store Pickup &amp; Hours</h4>
            <ul className="space-y-2 text-[#717171]">
              <li>Free 24-Hour Counter Pickup</li>
              <li>Mon-Sat: 8:00 AM - 8:00 PM</li>
              <li>Sun: 10:00 AM - 6:00 PM</li>
              <li>Instant Stock Allocation</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#222222] mb-3 text-xs">Texas Delivery Timelines</h4>
            <ul className="space-y-2 text-[#717171]">
              <li>Main Metro Cities (5 Days)</li>
              <li>Regional Texas (7 Days)</li>
              <li>Out of Stock Buffer (+3 Days)</li>
              <li>Dispatched from Austin Central WH</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-[#222222] mb-3 text-xs">Platform Navigation</h4>
            <ul className="space-y-2 text-[#717171]">
              <li>
                <Link href="/" className="hover:underline hover:text-[#222222]">
                  Overview Page
                </Link>
              </li>
              <li>
                <Link href="/products" className="hover:underline hover:text-[#222222]">
                  Search Products
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:underline hover:text-[#222222]">
                  Shopping Cart
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:underline hover:text-[#222222]">
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#717171]">
          <div className="flex items-center gap-2">
            <span>&copy; {new Date().getFullYear()} BrightBuy Texas Retail Inc.</span>
            <span>•</span>
            <span className="hover:underline cursor-pointer">Central Warehouse Stock System</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-[#222222]">
            <div className="flex items-center gap-1.5 cursor-pointer">
              <Globe className="w-4 h-4 text-[#717171]" />
              <span>English (US)</span>
            </div>
            <div className="cursor-pointer">$ USD</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
