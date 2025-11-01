"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { api } from "~/trpc/react";

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params?.id as string;

  const { data: company, isLoading } = api.company.getById.useQuery({
    id: companyId,
  });

  if (isLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse">
              <div className="h-8 bg-white/10 rounded w-48 mb-6"></div>
              <div className="h-32 bg-white/10 rounded mb-6"></div>
              <div className="h-64 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (!company) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl font-bold text-white mb-4">
              Company not found
            </h1>
            <Link
              href="/companies"
              className="text-purple-400 hover:text-purple-300"
            >
              ← Back to Companies
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link
            href="/companies"
            className="inline-block mb-6 text-purple-400 hover:text-purple-300 transition-colors"
          >
            ← Back to Companies
          </Link>

          {/* Company Card */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            {/* Title */}
            <div className="mb-8">
              <h1 className="text-4xl font-extrabold text-white mb-2">
                {company.name}
              </h1>
              <p className="text-xl text-gray-300 mb-4">{company.description}</p>
              
              {/* Use Case */}
              {company.useCase && (
                <div className="mt-4 p-4 bg-white/5 rounded-lg border border-white/10">
                  <p className="text-sm text-purple-400 font-semibold mb-2">
                    Use Case
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    {company.useCase}
                  </p>
                </div>
              )}
            </div>

            {/* Founder Section */}
            {company.founderName && (
              <div className="mb-8 p-6 bg-white/5 rounded-xl border border-white/10">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>👤</span> Founders
                </h2>
                <h3 className="text-xl font-semibold text-purple-400 mb-2">
                  {company.founderName}
                </h3>
                {company.founderBio && (
                  <p className="text-gray-300 leading-relaxed">
                    {company.founderBio}
                  </p>
                )}
              </div>
            )}

            {/* Video Section */}
            {company.videoUrl && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🎥</span> Founder's Story
                </h2>
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20 border border-white/10">
                  <iframe
                    src={company.videoUrl}
                    title={`${company.name} Founder Video`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  />
                </div>
              </div>
            )}

            {/* Website Link */}
            <div className="flex justify-center">
              <a
                href={company.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Visit Website
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-8 text-center text-gray-400 text-sm">
            <p>Founded • {new Date(company.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    </main>
  );
}

