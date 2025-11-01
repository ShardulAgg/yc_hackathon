"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import { api } from "~/trpc/react";

export default function CompanyDetailPage() {
  const params = useParams();
  const companyId = params?.id as string;
  const [selectedCreatorId, setSelectedCreatorId] = useState<number | null>(null);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: company, isLoading } = api.company.getById.useQuery({
    id: companyId,
  });

  const { data: creators, isLoading: isLoadingCreators } = api.video.getCreators.useQuery();

  const generateVideoMutation = api.video.generateVideo.useMutation({
    onSuccess: (data) => {
      setIsGenerating(false);
      if (data.video_url) {
        setGeneratedVideoUrl(data.video_url);
      }
    },
    onError: (error) => {
      setIsGenerating(false);
      alert(`Failed to generate video: ${error.message}`);
    },
  });

  const handleGenerateVideo = () => {
    if (selectedCreatorId === null || !company) return;

    setIsGenerating(true);
    generateVideoMutation.mutate({
      company_id: company.id,
      company_name: company.name,
      use_case: company.useCase || company.description,
      founder_name: company.founderName || "Founder",
      founder_role: "Founder", // Default role since not stored in DB
      interesting_context: company.interestingFact || "",
      creator_id: selectedCreatorId!,
    });
  };

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

              {/* Interesting Fact */}
              {company.interestingFact && (
                <div className="mt-4 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-lg border border-purple-500/20">
                  <p className="text-sm text-purple-400 font-semibold mb-2 flex items-center gap-2">
                    <span>✨</span> Interesting Fact
                  </p>
                  <p className="text-gray-300 leading-relaxed">
                    {company.interestingFact}
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

            {/* Video Generation Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <span>🎬</span> Generate Founder Video
              </h2>
              
              {/* Creator Selection */}
              {isLoadingCreators ? (
                <div className="p-6 bg-white/5 rounded-xl border border-white/10">
                  <div className="animate-pulse">
                    <div className="h-4 bg-white/10 rounded w-32 mb-4"></div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-24 bg-white/10 rounded-lg"></div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : creators && creators.length > 0 ? (
                <div className="mb-6">
                  <p className="text-gray-300 mb-4">
                    Select a creator to generate a personalized founder video:
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {creators.map((creator) => (
                      <button
                        key={creator.id}
                        onClick={() => setSelectedCreatorId(creator.id)}
                        className={`p-4 rounded-xl border transition-all ${
                          selectedCreatorId === creator.id
                            ? "bg-purple-600/30 border-purple-500 ring-2 ring-purple-500"
                            : "bg-white/5 border-white/10 hover:border-purple-500/50"
                        }`}
                      >
                        <div className="flex flex-col items-center text-center">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 mb-2 flex items-center justify-center text-white text-xl font-bold">
                            {creator.name.charAt(0)}
                          </div>
                          <p className="text-white text-sm font-semibold">{creator.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {/* Generate Button */}
                  <button
                    onClick={handleGenerateVideo}
                    disabled={selectedCreatorId === null || isGenerating}
                    className={`w-full px-6 py-3 rounded-xl font-semibold transition-all ${
                      selectedCreatorId === null || isGenerating
                        ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                        : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1"
                    }`}
                  >
                    {isGenerating ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Generating Video...
                      </span>
                    ) : (
                      "Generate Video with Selected Creator"
                    )}
                  </button>
                </div>
              ) : (
                <div className="p-6 bg-white/5 rounded-xl border border-white/10 text-center">
                  <p className="text-gray-400">No creators available</p>
                </div>
              )}

              {/* Generated Video Display */}
              {generatedVideoUrl && (
                <div className="mt-6">
                  <h3 className="text-xl font-bold text-white mb-4">Generated Video</h3>
                  <div className="relative aspect-video rounded-xl overflow-hidden bg-black/20 border border-white/10">
                    {generatedVideoUrl.startsWith("http") ? (
                      <iframe
                        src={generatedVideoUrl}
                        title={`${company.name} Generated Video`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="w-full h-full"
                      />
                    ) : (
                      <video
                        src={generatedVideoUrl}
                        controls
                        className="w-full h-full"
                      >
                        Your browser does not support the video tag.
                      </video>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Original Video Section */}
            {company.videoUrl && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                  <span>🎥</span> Founder&apos;s Story
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

