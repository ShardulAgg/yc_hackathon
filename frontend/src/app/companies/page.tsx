"use client";

import Link from "next/link";
import { useState } from "react";

import { api } from "~/trpc/react";

export default function CompaniesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: companies, isLoading } = api.company.getAll.useQuery();

  const filteredCompanies = companies?.filter(
    (company) =>
      company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      company.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (company.useCase?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false),
  );

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-12">
          <Link
            href="/"
            className="inline-block mb-6 text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Home
          </Link>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            Discover Companies
          </h1>
          <p className="text-xl text-gray-300 mb-6">
            Explore amazing SaaS startups and their founders
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl">
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            />
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 animate-pulse"
              >
                <div className="w-16 h-16 bg-white/10 rounded-lg mb-4"></div>
                <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-white/10 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* Companies Grid */}
        {!isLoading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompanies?.map((company) => (
              <div
                key={company.id}
                className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all hover:transform hover:-translate-y-2 group"
              >
                {/* Company Info */}
                <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-purple-400 transition-colors">
                  {company.name}
                </h2>
                <p className="text-gray-300 mb-4 line-clamp-3">
                  {company.description}
                </p>

                {/* Use Case */}
                {company.useCase && (
                  <div className="mb-4">
                    <p className="text-sm text-purple-400 font-semibold mb-1">
                      Use Case
                    </p>
                    <p className="text-gray-300 text-sm line-clamp-2">
                      {company.useCase}
                    </p>
                  </div>
                )}

                {/* Founder Info */}
                {company.founderName && (
                  <div className="mb-4">
                    <p className="text-sm text-purple-400 font-semibold mb-1">
                      Founder
                    </p>
                    <p className="text-white">{company.founderName}</p>
                    {company.founderBio && (
                      <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                        {company.founderBio}
                      </p>
                    )}
                  </div>
                )}

                {/* Links */}
                <div className="flex flex-col gap-2 mt-4">
                  <a
                    href={company.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-center rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all text-sm font-semibold"
                  >
                    Visit Website →
                  </a>
                  {company.videoUrl && (
                    <Link
                      href={`/companies/${company.id}`}
                      className="px-4 py-2 bg-white/10 text-white text-center rounded-lg hover:bg-white/20 border border-white/20 transition-all text-sm font-semibold"
                    >
                      Watch Founder Video →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredCompanies?.length === 0 && (
          <div className="text-center py-20">
            <p className="text-2xl text-gray-400 mb-4">No companies found</p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="text-purple-400 hover:text-purple-300"
              >
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
    </main>
  );
}

