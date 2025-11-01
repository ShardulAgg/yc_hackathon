"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

// Prevent static generation for this page
export const dynamic = "force-dynamic";

type TabType = "company" | "posts" | "creators";

// Creators data from video_agent
const fakeCreators = [
  {
    id: "1",
    name: "Samantha Hayes",
    bio: "Tech journalist and startup enthusiast covering YC companies. Passionate about uncovering the stories behind innovative founders building the future.",
    photoUrl: "/creator_media/samantha.jpg",
    platform: "samanthahayes_yc",
    followers: "125K",
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
    name: "Grace Mitchell",
    bio: "AI researcher turned content creator exploring the intersection of technology and entrepreneurship. Love spotting early-stage startups solving real problems.",
    photoUrl: "/creator_media/grace.jpg",
    platform: "Agent_grace_mail",
    followers: "98K",
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
    name: "Ava Reynolds",
    bio: "Silicon Valley reporter documenting the startup ecosystem. Always hunting for the next breakthrough idea and the brilliant minds behind them.",
    photoUrl: "/creator_media/ava.jpg",
    platform: "ava_browser_brown",
    followers: "210K",
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
    name: "Madison Brooks",
    bio: "Venture capital analyst and startup interviewer. Fascinated by founders who are bold enough to tackle the world's toughest challenges.",
    photoUrl: "/creator_media/madison.jpg",
    platform: "madison_ai_brooks",
    followers: "156K",
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
    name: "Emily Carter",
    bio: "Y Combinator community advocate and tech storyteller. On a mission to showcase founders who are building companies that matter.",
    photoUrl: "/creator_media/emily.jpg",
    platform: "emily_combinator_yc",
    followers: "187K",
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
];

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("company");
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  // Fetch creators from database
  const { data: dbCreators, isLoading: isLoadingCreators } = api.creator.getAll.useQuery();
  
  // Fetch generated videos for selected creator
  const { data: creatorVideos, isLoading: isLoadingVideos } = api.video.getVideosByCreator.useQuery(
    { creatorId: selectedCreator ?? "" },
    { enabled: !!selectedCreator }
  );

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

  const generateInterestingFact = api.company.generateInterestingFact.useMutation({
    onSuccess: (data) => {
      // Set the generated interesting fact in the textarea
      const interestingFactTextarea = document.querySelector(
        'textarea[name="interestingFact"]',
      );
      if (interestingFactTextarea instanceof HTMLTextAreaElement) {
        interestingFactTextarea.value = data.interestingFact;
        interestingFactTextarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    },
    onError: (error) => {
      alert(`Error generating interesting fact: ${error.message}`);
    },
  });

  const generateVideo = api.video.generateVideo.useMutation({
    onSuccess: (data) => {
      setIsGeneratingVideo(false);
      void utils.video.getVideosByCreator.invalidate();
      const cachedMsg = 'cached' in data && data.cached ? "(Used cached version)" : "";
      alert(`Video generated successfully! ${cachedMsg}`);
    },
    onError: (error) => {
      setIsGeneratingVideo(false);
      alert(`Error generating video: ${error.message}`);
    },
  });

  const handleGenerateVideo = () => {
    if (!selectedCreator || !company) {
      alert("Please select a creator and ensure you have company information saved!");
      return;
    }

    // Convert creator DB ID to video agent ID (reverse mapping)
    const CREATOR_ID_REVERSE_MAP: Record<string, number> = {
      "1": 0, // Samantha Hayes
      "2": 1, // Grace Mitchell
      "3": 2, // Ava Reynolds
      "4": 3, // Madison Brooks
      "5": 4, // Emily Carter
    };

    const creatorAgentId = CREATOR_ID_REVERSE_MAP[selectedCreator];
    
    if (creatorAgentId === undefined) {
      alert("Invalid creator selected!");
      return;
    }

    setIsGeneratingVideo(true);
    generateVideo.mutate({
      company_id: company.id,
      company_name: company.name,
      use_case: company.useCase || company.description,
      founder_name: company.founderName || "Founder",
      founder_role: "Founder",
      interesting_context: company.interestingFact || "",
      creator_id: creatorAgentId,
    });
  };

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
        interestingFact: getValue("interestingFact"),
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
        interestingFact: getValue("interestingFact"),
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
                  Interesting Fact (optional)
                </label>
                <textarea
                  name="interestingFact"
                  rows={3}
                  defaultValue={company?.interestingFact ?? ""}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  placeholder="Share an interesting, unique, or surprising fact about your company (e.g., origin story, unique approach, notable achievement, innovative feature)"
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
                    const useCase = formData.get("useCase") as string;
                    
                    if (!websiteUrl || websiteUrl.trim() === "") {
                      alert("Please enter a website URL first!");
                      return;
                    }
                    
                    generateInterestingFact.mutate({
                      websiteUrl: websiteUrl.trim(),
                      companyName: companyName ? companyName.trim() : undefined,
                      description: description ? description.trim() : undefined,
                      useCase: useCase ? useCase.trim() : undefined,
                    });
                  }}
                  disabled={generateInterestingFact.isPending}
                  className="mt-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {generateInterestingFact.isPending ? (
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
                    {isLoadingCreators ? (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="p-6 rounded-xl border border-white/10 bg-white/5 animate-pulse">
                            <div className="w-24 h-24 rounded-full bg-white/10 mx-auto mb-4"></div>
                            <div className="h-4 bg-white/10 rounded w-3/4 mx-auto mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-1/2 mx-auto mb-2"></div>
                            <div className="h-3 bg-white/10 rounded w-full"></div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {(dbCreators ?? fakeCreators).map((creator) => (
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
                            <p className="text-sm text-purple-400 text-center mb-2">
                              <a
                                href={`https://instagram.com/${creator.platform}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-purple-300 transition-colors"
                                onClick={(e) => e.stopPropagation()}
                              >
                                @{creator.platform}
                              </a> • {creator.followers} followers
                            </p>
                            <p className="text-gray-300 text-sm text-center line-clamp-3">
                              {creator.bio}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  // Creator Detail View
                  (() => {
                    const creators = dbCreators ?? fakeCreators;
                    const creator = creators.find((c) => c.id === selectedCreator);
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
                            <a
                              href={`https://instagram.com/${creator.platform}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="hover:text-purple-300 transition-colors"
                            >
                              @{creator.platform}
                            </a> • {creator.followers} followers
                          </p>
                          <p className="text-gray-300 text-sm text-center leading-relaxed">
                            {creator.bio}
                          </p>

                          {/* Generate Video Button */}
                          {company && (
                            <div className="mt-6">
                              <button
                                onClick={handleGenerateVideo}
                                disabled={isGeneratingVideo}
                                className={`w-full px-6 py-3 rounded-xl font-semibold transition-all ${
                                  isGeneratingVideo
                                    ? "bg-gray-600/50 text-gray-400 cursor-not-allowed"
                                    : "bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 transform hover:-translate-y-1 shadow-lg hover:shadow-xl"
                                }`}
                              >
                                {isGeneratingVideo ? (
                                  <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating Video...
                                  </span>
                                ) : (
                                  <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Generate Video
                                  </span>
                                )}
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Generated Videos Panel */}
                        <div className="lg:w-2/3 bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
                          <h2 className="text-2xl font-bold text-white mb-6">Generated Videos</h2>
                          <p className="text-gray-300 mb-8">
                            Videos generated by this creator for various companies
                          </p>

                          {isLoadingVideos ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} className="rounded-xl overflow-hidden border border-white/10 bg-white/5 animate-pulse">
                                  <div className="w-full h-48 bg-white/10"></div>
                                  <div className="p-4">
                                    <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
                                    <div className="h-3 bg-white/10 rounded w-1/2"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : creatorVideos && creatorVideos.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {creatorVideos.map((post) => (
                                <div
                                  key={post.id}
                                  className="rounded-xl overflow-hidden border border-white/10 bg-white/5 hover:border-purple-500/50 transition-all"
                                >
                                  {post.videos && post.videos.length > 0 ? (
                                    <div className="relative">
                                      {post.videos[0]!.url === "placeholder.mp4" || post.videos[0]!.url.includes("placeholder.mp4") ? (
                                        <div className="relative aspect-video bg-gradient-to-br from-purple-900/50 to-pink-900/50 flex items-center justify-center border border-white/10">
                                          <div className="text-center">
                                            <svg
                                              className="w-16 h-16 mx-auto mb-4 text-purple-400"
                                              fill="none"
                                              stroke="currentColor"
                                              viewBox="0 0 24 24"
                                            >
                                              <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                                              />
                                            </svg>
                                            <p className="text-white font-semibold">Video Processing</p>
                                            <p className="text-gray-400 text-sm mt-1">This video is being generated</p>
                                          </div>
                                        </div>
                                      ) : post.videos[0]!.url.endsWith(".mp4") || post.videos[0]!.url.includes(".mp4") ? (
                                        <video
                                          src={post.videos[0]!.url}
                                          controls
                                          className="w-full h-full"
                                          style={{ maxHeight: "400px" }}
                                        >
                                          Your browser does not support the video tag.
                                        </video>
                                      ) : post.videos[0]!.url.startsWith("http") && (post.videos[0]!.url.includes("youtube") || post.videos[0]!.url.includes("youtu.be") || post.videos[0]!.url.includes("vimeo")) ? (
                                        <div className="relative aspect-video bg-black/20">
                                          <iframe
                                            src={post.videos[0]!.url}
                                            title={post.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                            className="w-full h-full"
                                          />
                                        </div>
                                      ) : (
                                        <video
                                          src={post.videos[0]!.url}
                                          controls
                                          className="w-full h-auto"
                                          style={{ maxHeight: "400px" }}
                                        >
                                          Your browser does not support the video tag.
                                        </video>
                                      )}
                                      <div className="absolute top-4 right-4">
                                        <div className={`text-white px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${
                                          post.videos[0]!.url === "placeholder.mp4" ? "bg-yellow-500" : "bg-red-500"
                                        }`}>
                                          <svg
                                            className="w-4 h-4"
                                            fill="currentColor"
                                            viewBox="0 0 20 20"
                                          >
                                            <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                          </svg>
                                          {post.videos[0]!.url === "placeholder.mp4" ? "Processing" : "Video"}
                                        </div>
                                      </div>
                                    </div>
                                  ) : post.images && post.images.length > 0 ? (
                                    <div className="relative">
                                      <img
                                        src={post.images[0]!.url}
                                        alt={post.title}
                                        className="w-full h-auto"
                                      />
                                      <div className="absolute top-4 right-4">
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
                                      </div>
                                    </div>
                                  ) : null}
                                  <div className="p-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">
                                      {post.title}
                                    </h3>
                                    {post.description && (
                                      <p className="text-gray-300 text-sm mb-2 line-clamp-2">
                                        {post.description}
                                      </p>
                                    )}
                                    {post.company && (
                                      <p className="text-purple-400 text-xs">
                                        For: {post.company.name}
                                      </p>
                                    )}
                                    <p className="text-gray-500 text-xs mt-2">
                                      {new Date(post.createdAt).toLocaleDateString()}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-center py-12">
                              <p className="text-gray-400 mb-2">No videos generated yet</p>
                              <p className="text-sm text-gray-500">
                                Videos created by this creator will appear here
                              </p>
                            </div>
                          )}
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

