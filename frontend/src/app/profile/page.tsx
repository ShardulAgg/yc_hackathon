"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

// Prevent static generation for this page
export const dynamic = "force-dynamic";

type TabType = "company" | "posts" | "creators";

// Fake creators data with demo content
const fakeCreators = [
  {
    id: "1",
    name: "Alex Rivera",
    bio: "Tech content creator sharing the latest SaaS trends and startup stories. Former founder turned educator.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexRivera",
    platform: "YouTube",
    followers: "250K",
    demos: [
      {
        id: "1",
        type: "video" as const,
        thumbnail: "https://placehold.co/640x360/E9D5FF/E9D5FF?text=Product+Demo+Video",
        title: "SaaS Product Walkthrough",
      },
      {
        id: "2",
        type: "video" as const,
        thumbnail: "https://placehold.co/640x360/D8B4FE/D8B4FE?text=Founder+Interview",
        title: "Founder Success Story",
      },
      {
        id: "3",
        type: "image" as const,
        thumbnail: "https://placehold.co/640x360/C084FC/C084FC?text=Product+Showcase",
        title: "Feature Highlights",
      },
    ],
  },
  {
    id: "2",
    name: "Jordan Kim",
    bio: "Instagram tech influencer specializing in productivity tools and B2B software reviews.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=JordanKim",
    platform: "Instagram",
    followers: "180K",
    demos: [
      {
        id: "1",
        type: "image" as const,
        thumbnail: "https://placehold.co/640x640/EC4899/EC4899?text=Instagram+Carousel",
        title: "Product Benefits Carousel",
      },
      {
        id: "2",
        type: "video" as const,
        thumbnail: "https://placehold.co/640x640/F43F5E/F43F5E?text=Reel+Demo",
        title: "Quick Feature Reel",
      },
      {
        id: "3",
        type: "image" as const,
        thumbnail: "https://placehold.co/640x640/F472B6/F472B6?text=Case+Study",
        title: "Customer Success Story",
      },
    ],
  },
  {
    id: "3",
    name: "Taylor Chen",
    bio: "TikTok viral creator making complex tech topics accessible. Reaching Gen Z entrepreneurs.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=TaylorChen",
    platform: "TikTok",
    followers: "500K",
    demos: [
      {
        id: "1",
        type: "video" as const,
        thumbnail: "https://placehold.co/640x854/14B8A6/14B8A6?text=TikTok+Viral+Video",
        title: "Trending Product Hack",
      },
      {
        id: "2",
        type: "video" as const,
        thumbnail: "https://placehold.co/640x854/10B981/10B981?text=Behind+the+Scenes",
        title: "Day in the Life Demo",
      },
      {
        id: "3",
        type: "video" as const,
        thumbnail: "https://placehold.co/640x854/06B6D4/06B6D4?text=Quick+Tutorial",
        title: "60-Second Tutorial",
      },
    ],
  },
  {
    id: "4",
    name: "Morgan Lee",
    bio: "LinkedIn thought leader in SaaS marketing. Connecting founders with their ideal customers.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MorganLee",
    platform: "LinkedIn",
    followers: "95K",
    demos: [
      {
        id: "1",
        type: "image" as const,
        thumbnail: "https://placehold.co/640x480/0EA5E9/0EA5E9?text=LinkedIn+Article",
        title: "Industry Insights Article",
      },
      {
        id: "2",
        type: "video" as const,
        thumbnail: "https://placehold.co/640x360/0284C7/0284C7?text=Webinar+Clip",
        title: "Expert Panel Discussion",
      },
      {
        id: "3",
        type: "image" as const,
        thumbnail: "https://placehold.co/640x360/0369A1/0369A1?text=Infographic",
        title: "Data & Statistics Infographic",
      },
    ],
  },
  {
    id: "5",
    name: "Casey Brooks",
    bio: "YouTube long-form content creator focused on founder interviews and product deep dives.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=CaseyBrooks",
    platform: "YouTube",
    followers: "150K",
    demos: [
      {
        id: "1",
        type: "video" as const,
        thumbnail: "https://placehold.co/1280x720/EF4444/EF4444?text=YouTube+Tutorial",
        title: "Complete Product Guide",
      },
      {
        id: "2",
        type: "video" as const,
        thumbnail: "https://placehold.co/1280x720/DC2626/DC2626?text=Review+Video",
        title: "Detailed Product Review",
      },
      {
        id: "3",
        type: "video" as const,
        thumbnail: "https://placehold.co/1280x720/B91C1C/B91C1C?text=Comparison+Video",
        title: "Competitor Comparison",
      },
    ],
  },
  {
    id: "6",
    name: "Sam Park",
    bio: "Multi-platform creator covering software reviews, startup journeys, and tech industry insights.",
    photoUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SamPark",
    platform: "Instagram",
    followers: "320K",
    demos: [
      {
        id: "1",
        type: "video" as const,
        thumbnail: "https://placehold.co/640x640/A855F7/A855F7?text=IGTV+Content",
        title: "Long-form IGTV Episode",
      },
      {
        id: "2",
        type: "image" as const,
        thumbnail: "https://placehold.co/640x640/9333EA/9333EA?text=Stories",
        title: "Interactive Stories Series",
      },
      {
        id: "3",
        type: "video" as const,
        thumbnail: "https://placehold.co/640x640/7C3AED/7C3AED?text=Highlight",
        title: "Best Practices Highlight",
      },
    ],
  },
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("company");
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);

  const utils = api.useUtils();
  const { data: user, isLoading: userLoading } = api.auth.me.useQuery();
  const { data: company } = api.company.getByUserId.useQuery(
    undefined,
    { enabled: !!user }
  );
  const { data: posts } = api.post.getByUserId.useQuery(
    undefined,
    { enabled: !!user }
  );

  const createCompany = api.company.create.useMutation({
    onSuccess: () => {
      void utils.company.getByUserId.invalidate();
      alert("Company information saved!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateCompany = api.company.update.useMutation({
    onSuccess: () => {
      void utils.company.getByUserId.invalidate();
      alert("Company information updated!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const generateUseCase = api.company.generateUseCase.useMutation({
    onSuccess: (data) => {
      // Set the generated use case in the textarea
      const useCaseTextarea = document.querySelector(
        'textarea[name="useCase"]',
      );
      if (useCaseTextarea instanceof HTMLTextAreaElement) {
        useCaseTextarea.value = data.useCase;
        useCaseTextarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    },
    onError: (error) => {
      alert(`Error generating use case: ${error.message}`);
    },
  });

  // Show loading state while checking authentication
  if (userLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </main>
    );
  }

  // Redirect if not logged in
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleCompanySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    // Helper function to convert empty strings to undefined
    const getValue = (key: string): string | undefined => {
      const value = formData.get(key) as string;
      return value && value.trim() !== "" ? value.trim() : undefined;
    };
    
    const useCase = formData.get("useCase") as string;
    if (!useCase || useCase.trim() === "") {
      alert("Use Case is required!");
      return;
    }

    if (company) {
      // Update existing company
      updateCompany.mutate({
        id: company.id,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        websiteUrl: formData.get("websiteUrl") as string,
        useCase: useCase.trim(),
        videoUrl: getValue("videoUrl"),
        founderName: getValue("founderName"),
        founderBio: getValue("founderBio"),
      });
    } else {
      // Create new company
      createCompany.mutate({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        websiteUrl: formData.get("websiteUrl") as string,
        useCase: useCase.trim(),
        videoUrl: getValue("videoUrl"),
        founderName: getValue("founderName"),
        founderBio: getValue("founderBio"),
      });
    }
  };


  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
            Your Profile
          </h1>
          <p className="text-xl text-gray-300">
            Manage your company information and posts
          </p>
        </div>

        {/* Main Content with Sidebar */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar Navigation */}
          <div className="lg:w-64 flex-shrink-0">
            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-4 border border-white/10">
              <nav className="space-y-2">
                <button
                  onClick={() => setActiveTab("company")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-3 ${
                    activeTab === "company"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
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
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                  Company Info
                </button>
                <button
                  onClick={() => setActiveTab("posts")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-3 ${
                    activeTab === "posts"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
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
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Posts
                </button>
                <button
                  onClick={() => setActiveTab("creators")}
                  className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-3 ${
                    activeTab === "creators"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }`}
                >
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
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  Creators
                </button>
              </nav>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            {/* Company Tab */}
            {activeTab === "company" && (
              <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
            <h2 className="text-2xl font-bold text-white mb-6">Company Information</h2>
            
            <form onSubmit={handleCompanySubmit} className="space-y-6">
              <div>
                <label className="block text-white font-semibold mb-2">
                  Company Name <span className="text-red-400">*</span>
                </label>
                <input
                  name="name"
                  required
                  defaultValue={company?.name}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter company name"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Description <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  defaultValue={company?.description}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Describe your company..."
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Website URL <span className="text-red-400">*</span>
                </label>
                <input
                  name="websiteUrl"
                  type="url"
                  required
                  defaultValue={company?.websiteUrl}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://yourcompany.com"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Use Case <span className="text-red-400">*</span>
                </label>
                <textarea
                  name="useCase"
                  required
                  rows={3}
                  defaultValue={company?.useCase ?? ""}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Describe the primary use case or industry application (e.g., 'SaaS for e-commerce businesses', 'CRM for real estate agents', 'Analytics tool for marketing teams')"
                />
                <button
                  type="button"
                  onClick={() => {
                    const form = document.querySelector('form');
                    if (!form) return;
                    
                    const formData = new FormData(form);
                    const websiteUrl = formData.get("websiteUrl") as string;
                    const companyName = formData.get("name") as string;
                    const description = formData.get("description") as string;
                    
                    if (!websiteUrl || websiteUrl.trim() === "") {
                      alert("Please enter a website URL first!");
                      return;
                    }
                    
                    generateUseCase.mutate({
                      websiteUrl: websiteUrl.trim(),
                      companyName: companyName ? companyName.trim() : undefined,
                      description: description ? description.trim() : undefined,
                    });
                  }}
                  disabled={generateUseCase.isPending}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-lg hover:from-blue-700 hover:to-cyan-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generateUseCase.isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Generating...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Auto Generate with AI
                    </>
                  )}
                </button>
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Founder Name (optional)
                </label>
                <input
                  name="founderName"
                  defaultValue={company?.founderName ?? ""}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Enter founder's name"
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Founder Bio (optional)
                </label>
                <textarea
                  name="founderBio"
                  rows={3}
                  defaultValue={company?.founderBio ?? ""}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Tell us about the founder..."
                />
              </div>

              <div>
                <label className="block text-white font-semibold mb-2">
                  Founder Video URL (optional)
                </label>
                <input
                  name="videoUrl"
                  type="url"
                  defaultValue={company?.videoUrl ?? ""}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="YouTube/Vimeo embed URL"
                />
                <p className="mt-2 text-sm text-gray-400">
                  Use embed URLs (e.g., https://www.youtube.com/embed/VIDEO_ID)
                </p>
              </div>

              <button
                type="submit"
                disabled={createCompany.isPending || updateCompany.isPending}
                className="w-full px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {createCompany.isPending || updateCompany.isPending
                  ? "Saving..."
                  : company
                    ? "Update Company"
                    : "Save Company"}
              </button>
            </form>
              </div>
            )}

            {/* Posts Tab */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                {!company && (
                  <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 text-yellow-200">
                    Please create company information first!
                  </div>
                )}

                <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-white mb-2">Creator Posts</h2>
                    <p className="text-gray-300 text-sm">
                      Posts created by influencers promoting your company
                    </p>
                  </div>

                  {/* Posts List */}
                  <div className="space-y-4">
                    {posts && posts.length > 0 ? (
                      posts.map((post) => (
                        <div
                          key={post.id}
                          className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/50 transition-all"
                        >
                          {/* Creator Info */}
                          {post.creator && (
                            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/10">
                              <img
                                src={post.creator.photoUrl}
                                alt={post.creator.name}
                                className="w-12 h-12 rounded-full border-2 border-purple-500"
                              />
                              <div className="flex-1">
                                <p className="text-white font-semibold">{post.creator.name}</p>
                                <p className="text-sm text-gray-400">
                                  {post.creator.platform} • {post.creator.followers} followers
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Post Content */}
                          <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                          {post.description && (
                            <p className="text-gray-300 mb-4">{post.description}</p>
                          )}

                          {/* Post Media */}
                          {post.images && post.images.length > 0 && (
                            <div className="grid grid-cols-2 gap-2 mb-4">
                              {post.images.map((image) => (
                                <img
                                  key={image.id}
                                  src={image.url}
                                  alt="Post image"
                                  className="w-full h-auto rounded-lg"
                                />
                              ))}
                            </div>
                          )}

                          {post.videos && post.videos.length > 0 && (
                            <div className="space-y-2 mb-4">
                              {post.videos.map((video) => (
                                <div key={video.id} className="relative aspect-video rounded-lg overflow-hidden bg-black/20">
                                  <iframe
                                    src={video.url}
                                    title="Post video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    className="w-full h-full"
                                  />
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Post Meta */}
                          <p className="text-sm text-gray-400">
                            Posted: {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <p className="text-gray-400 mb-2">No creator posts yet</p>
                        <p className="text-sm text-gray-500">
                          Posts created by selected creators will appear here
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Creators Tab */}
            {activeTab === "creators" && (
              <div className="space-y-6">
                {!selectedCreator ? (
                  // Creators List View
                  <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                    <h2 className="text-2xl font-bold text-white mb-6">Browse Creators</h2>
                    <p className="text-gray-300 mb-8">
                      Explore creators and their demo content for your company
                    </p>

                    {/* Creators Grid */}
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {fakeCreators.map((creator) => (
                        <div
                          key={creator.id}
                          className="p-6 rounded-xl border border-white/10 bg-white/5 hover:border-purple-500/50 transition-all cursor-pointer"
                          onClick={() => setSelectedCreator(creator.id)}
                        >
                          {/* Avatar */}
                          <div className="flex justify-center mb-4">
                            <img
                              src={creator.photoUrl}
                              alt={creator.name}
                              className="w-24 h-24 rounded-full border-4 border-white/20"
                            />
                          </div>

                          {/* Info */}
                          <h3 className="text-xl font-bold text-white text-center mb-2">
                            {creator.name}
                          </h3>
                          <p className="text-sm text-purple-400 text-center mb-3">
                            {creator.platform} • {creator.followers} followers
                          </p>
                          <p className="text-gray-300 text-sm text-center line-clamp-3">
                            {creator.bio}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  // Creator Detail View
                  (() => {
                    const creator = fakeCreators.find((c) => c.id === selectedCreator);
                    if (!creator) return null;

                    return (
                      <div className="flex flex-col lg:flex-row gap-6">
                        {/* Creator Info Panel */}
                        <div className="lg:w-1/3 bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                          <button
                            onClick={() => setSelectedCreator(null)}
                            className="text-purple-400 hover:text-purple-300 mb-6 flex items-center gap-2"
                          >
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
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                              />
                            </svg>
                            Back to Creators
                          </button>

                          {/* Avatar */}
                          <div className="flex justify-center mb-6">
                            <img
                              src={creator.photoUrl}
                              alt={creator.name}
                              className="w-32 h-32 rounded-full border-4 border-purple-500"
                            />
                          </div>

                          {/* Info */}
                          <h2 className="text-2xl font-bold text-white text-center mb-3">
                            {creator.name}
                          </h2>
                          <p className="text-sm text-purple-400 text-center mb-4">
                            {creator.platform} • {creator.followers} followers
                          </p>
                          <p className="text-gray-300 text-sm text-center leading-relaxed">
                            {creator.bio}
                          </p>
                        </div>

                        {/* Demo Content Panel */}
                        <div className="lg:w-2/3 bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                          <h2 className="text-2xl font-bold text-white mb-6">Demo Content</h2>
                          <p className="text-gray-300 mb-8">
                            Sample videos and content this creator could produce for your company
                          </p>

                          {/* Demo Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {creator.demos.map((demo) => (
                              <div
                                key={demo.id}
                                className="rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-purple-500/50 transition-all cursor-pointer"
                              >
                                <div className="relative">
                                  {/* Thumbnail/Image */}
                                  <img
                                    src={demo.thumbnail}
                                    alt={demo.title}
                                    className="w-full h-auto"
                                  />
                                  {/* Video/Image Badge */}
                                  <div className="absolute top-4 right-4">
                                    {demo.type === "video" ? (
                                      <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <svg
                                          className="w-4 h-4"
                                          fill="currentColor"
                                          viewBox="0 0 20 20"
                                        >
                                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                        </svg>
                                        Video
                                      </div>
                                    ) : (
                                      <div className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                                        <svg
                                          className="w-4 h-4"
                                          fill="none"
                                          stroke="currentColor"
                                          viewBox="0 0 24 24"
                                        >
                                          <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                          />
                                        </svg>
                                        Image
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div className="p-4">
                                  <h3 className="text-lg font-semibold text-white">
                                    {demo.title}
                                  </h3>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

