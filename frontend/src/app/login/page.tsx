"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export default function LoginPage() {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: user } = api.auth.me.useQuery();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const login = api.auth.login.useMutation({
    onSuccess: async (data) => {
      // Store session ID
      if (typeof window !== "undefined") {
        localStorage.setItem("sessionId", data.sessionId);
        // Invalidate and refetch auth queries to pick up new session
        await utils.auth.me.invalidate();
        // Use window.location for a hard redirect to ensure navigation
        window.location.href = "/profile";
      }
    },
    onError: (error) => {
      alert(`Login failed: ${error.message}`);
    },
  });
  
  // Redirect if already logged in
  if (user) {
    router.replace("/profile");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(formData);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link
          href="/"
          className="inline-block mb-6 text-purple-400 hover:text-purple-300 transition-colors"
        >
          ← Back to Home
        </Link>

        {/* Card */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-2xl">
          <h1 className="text-4xl font-extrabold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-300 mb-8">Sign in to your account</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-white font-semibold mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your email"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-white font-semibold mb-2"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your password"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={login.isPending}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {login.isPending ? "Signing in..." : "Sign In"}
            </button>
          </form>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-gray-300">
            Don&apos;t have an account?{" "}
            <Link
              href="/signup"
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}


