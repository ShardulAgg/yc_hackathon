"use client";

import Link from "next/link";

import { api } from "~/trpc/react";

export function Nav() {
  const { data: user } = api.auth.me.useQuery();
  const logout = api.auth.logout.useMutation({
    onSuccess: () => {
      if (typeof window !== "undefined") {
        localStorage.removeItem("sessionId");
      }
      window.location.href = "/";
    },
  });

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      const sessionId = localStorage.getItem("sessionId");
      // Note: logout mutation needs to be updated to work properly
      logout.mutate();
    }
  };

  return (
    <nav className="bg-white/5 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600"
          >
            SaaS Discovery
          </Link>
          <div className="flex items-center gap-6">
            <Link
              href="/companies"
              className="text-white hover:text-purple-400 transition-colors"
            >
              Companies
            </Link>
            {user ? (
              <>
                <Link
                  href="/profile"
                  className="text-white hover:text-purple-400 transition-colors"
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20 transition-all font-semibold"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-purple-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

