import Link from "next/link";

import { api, HydrateClient } from "~/trpc/server";

// Prevent static generation to avoid build-time database issues
export const dynamic = "force-dynamic";

export default async function Home() {
  // Only prefetch if database is available (skip during build if not configured)
  try {
    void api.company.getAll.prefetch();
  } catch {
    // Ignore errors during build/prerender
  }

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-white mb-6">
              Discover Amazing{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                SaaS Companies
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-3xl mx-auto">
              Connect with innovative startups and founders building the future
              of technology
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/companies"
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Explore Companies
              </Link>
              <Link
                href="/signup"
                className="px-8 py-4 bg-white/10 backdrop-blur-md text-white text-lg font-semibold rounded-xl hover:bg-white/20 border border-white/20 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-20">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="text-4xl mb-4">🚀</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Grow Your Reach
              </h3>
              <p className="text-gray-300">
                Showcase your startup to thousands of potential customers and
                investors
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Founder Stories
              </h3>
              <p className="text-gray-300">
                Share your founder&apos;s journey through video and connect with your
                audience
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
              <div className="text-4xl mb-4">🌐</div>
              <h3 className="text-2xl font-bold text-white mb-3">
                Global Exposure
              </h3>
              <p className="text-gray-300">
                Reach users worldwide and expand your market presence
              </p>
            </div>
          </div>
        </div>
      </main>
    </HydrateClient>
  );
}
