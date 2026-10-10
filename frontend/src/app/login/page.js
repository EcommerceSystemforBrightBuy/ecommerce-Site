"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useShop } from "@/context/ShopContext";
import { UserCheck } from "lucide-react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect") || "/products";

  const { currentUser, authReady, loginUser, logoutUser } = useShop();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Ask the backend to check the email + password (POST /api/auth/login)
      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (!response.ok || !result.success) {
        setError(result.error || "Login failed. Please try again.");
        return;
      }

      await loginUser(result.user); // keeps the user in context + localStorage, merges the guest cart
      router.push(redirect);
    } catch (err) {
      console.error("Login error:", err);
      setError("Could not reach the server. Please check that the backend is running.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!authReady) {
    return <div className="p-12 text-center text-xs text-[#717171]">Loading authentication...</div>;
  }

  return (
    <main className="max-w-md mx-auto px-4 sm:px-6 py-14 space-y-8">
      <div className="border-b border-[#EBEBEB] pb-5">
        <span className="text-xs font-bold text-[#FF385C] uppercase tracking-wider">
          Authentication
        </span>
        <h1 className="text-2xl font-black text-[#222222] mt-0.5">
          Sign In to BrightBuy
        </h1>
        <p className="text-xs text-[#717171] mt-1">
          Registered accounts are required for checkout and atomic warehouse reservation.
        </p>
      </div>

      {currentUser ? (
        <div className="border border-[#DDDDDD] rounded-3xl p-6 space-y-4 text-xs bg-white shadow-sm">
          <div className="flex items-center gap-2 font-bold text-[#222222] text-sm">
            <UserCheck className="w-4 h-4 text-[#FF385C]" />
            <span>Currently Signed In</span>
          </div>
          <div className="space-y-1 text-[#717171]">
            <div>Name: <strong className="text-[#222222]">{currentUser.name}</strong></div>
            <div>Email: <span className="font-mono text-[#222222]">{currentUser.email}</span></div>
            <div>Phone: <span className="text-[#222222] font-semibold">{currentUser.phone}</span></div>
            <div>City: <span className="text-[#222222] font-semibold">{currentUser.city}, TX</span></div>
          </div>
          <div className="flex items-center gap-3 pt-3">
            <Link
              href="/cart"
              className="flex-1 py-3 bg-[#FF385C] hover:bg-[#E00B41] text-white text-center font-bold rounded-xl transition-colors shadow-sm text-xs"
            >
              Continue to Cart
            </Link>
            <Link
              href="/account"
              className="px-4 py-3 border border-[#DDDDDD] text-[#222222] font-bold rounded-xl hover:bg-[#F7F7F7] transition-colors"
            >
              My Profile
            </Link>
            <button
              type="button"
              onClick={logoutUser}
              className="px-4 py-3 border border-[#DDDDDD] text-[#222222] font-bold rounded-xl hover:bg-[#F7F7F7] transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <form onSubmit={handleLogin} className="border border-[#DDDDDD] rounded-3xl p-6 space-y-4 text-xs bg-white shadow-sm">
            <div>
              <label className="block text-[#222222] font-bold mb-1 text-xs">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="shopper@texasmail.com"
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            <div>
              <label className="block text-[#222222] font-bold mb-1 text-xs">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#F7F7F7] border border-[#DDDDDD] rounded-xl p-3 text-xs text-[#222222]"
              />
            </div>

            {error && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 font-semibold">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3.5 bg-[#FF385C] hover:bg-[#E00B41] disabled:opacity-60 text-white text-xs font-bold rounded-xl transition-colors shadow-md"
            >
              {submitting ? "Signing in..." : "Sign In to Customer Account"}
            </button>
          </form>

          {/* Registration link */}
          <div className="pt-2 text-center text-xs text-[#717171] space-y-2">
            <div>
              Don&apos;t have an account?{" "}
              <Link
                href={`/register?redirect=${encodeURIComponent(redirect)}`}
                className="font-bold text-[#FF385C] underline"
              >
                Register Customer
              </Link>
            </div>
            <div>
              <Link href="/products" className="text-xs text-[#717171] hover:text-[#222222]">
                Continue Browsing as Guest &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-[#717171]">Loading authentication...</div>}>
      <LoginForm />
    </Suspense>
  );
}
