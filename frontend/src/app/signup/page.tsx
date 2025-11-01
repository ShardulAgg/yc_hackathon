"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

export default function SignupPage() {
  const router = useRouter();
  const utils = api.useUtils();
  
  const signup = api.auth.signup.useMutation({
    onSuccess: (data) => {
      // Store session ID
      if (typeof window !== "undefined") {
        localStorage.setItem("sessionId", data.sessionId);
        // Invalidate and refetch auth queries to pick up new session
        void utils.auth.me.invalidate();
        // Small delay to ensure session is stored before navigation
        setTimeout(() => {
          router.push("/profile");
        }, 100);
      }
    },
    onError: (error) => {
      alert(`Signup failed: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    signup.mutate(formData);
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
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Create Account
          </h1>
          <p className="text-gray-300 mb-8">
            Sign up to promote your SaaS company
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-white font-semibold mb-2"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="Enter your full name"
              />
            </div>

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
                minLength={6}
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="At least 6 characters"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={signup.isPending}
              className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {signup.isPending ? "Creating account..." : "Create Account"}
            </button>
          </form>

          {/* Login Link */}
          <p className="mt-6 text-center text-gray-300">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}


