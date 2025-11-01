"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { api } from "~/trpc/react";

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
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState<string | null>(null);

  const { data: user } = api.auth.me.useQuery();
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
      void api.company.getByUserId.invalidate();
      alert("Company information saved!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const updateCompany = api.company.update.useMutation({
    onSuccess: () => {
      void api.company.getByUserId.invalidate();
      alert("Company information updated!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  const createPost = api.post.create.useMutation({
    onSuccess: () => {
      void api.post.getByUserId.invalidate();
      setIsCreatingPost(false);
      alert("Post created!");
    },
    onError: (error) => {
      alert(`Error: ${error.message}`);
    },
  });

  // Redirect if not logged in
  if (!user) {
    router.push("/login");
    return null;
  }

  const handleCompanySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (company) {
      // Update existing company
      updateCompany.mutate({
        id: company.id,
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        websiteUrl: formData.get("websiteUrl") as string,
        logoUrl: (formData.get("logoUrl") as string) || undefined,
        videoUrl: (formData.get("videoUrl") as string) || undefined,
        founderName: (formData.get("founderName") as string) || undefined,
        founderBio: (formData.get("founderBio") as string) || undefined,
      });
    } else {
      // Create new company
      createCompany.mutate({
        name: formData.get("name") as string,
        description: formData.get("description") as string,
        websiteUrl: formData.get("websiteUrl") as string,
        logoUrl: (formData.get("logoUrl") as string) || undefined,
        videoUrl: (formData.get("videoUrl") as string) || undefined,
        founderName: (formData.get("founderName") as string) || undefined,
        founderBio: (formData.get("founderBio") as string) || undefined,
      });
    }
  };

  const handlePostSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    if (!company) {
      alert("Please create company information first!");
      return;
    }

    createPost.mutate({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
    });
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-900 via-purple-900 to-slate-900 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-2">
            Your Profile
          </h1>
          <p className="text-xl text-gray-300">
            Manage your company information and posts
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8 flex gap-4 border-b border-white/10">
          <button
            onClick={() => setActiveTab("company")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "company"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Company Info
          </button>
          <button
            onClick={() => setActiveTab("posts")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "posts"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Posts
          </button>
          <button
            onClick={() => setActiveTab("creators")}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === "creators"
                ? "text-purple-400 border-b-2 border-purple-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Creators
          </button>
        </div>

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
                  Logo URL (optional)
                </label>
                <input
                  name="logoUrl"
                  type="url"
                  defaultValue={company?.logoUrl ?? ""}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://yourcompany.com/logo.png"
                />
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
                Please create company information first before posting!
              </div>
            )}

            <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">Your Posts</h2>
                {company && (
                  <button
                    onClick={() => setIsCreatingPost(true)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold"
                  >
                    + Create Post
                  </button>
                )}
              </div>

              {/* Create Post Form */}
              {isCreatingPost && (
                <div className="mb-8 p-6 bg-white/5 rounded-lg border border-white/10">
                  <h3 className="text-xl font-bold text-white mb-4">Create New Post</h3>
                  <form onSubmit={handlePostSubmit} className="space-y-4">
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Title <span className="text-red-400">*</span>
                      </label>
                      <input
                        name="title"
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        placeholder="Post title"
                      />
                    </div>
                    <div>
                      <label className="block text-white font-semibold mb-2">
                        Description (optional)
                      </label>
                      <textarea
                        name="description"
                        rows={4}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                        placeholder="Post description..."
                      />
                    </div>
                    <div className="flex gap-4">
                      <button
                        type="submit"
                        disabled={createPost.isPending}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {createPost.isPending ? "Creating..." : "Create Post"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsCreatingPost(false)}
                        className="px-6 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 border border-white/20 transition-all font-semibold"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Posts List */}
              <div className="space-y-4">
                {posts && posts.length > 0 ? (
                  posts.map((post) => (
                    <div
                      key={post.id}
                      className="p-6 bg-white/5 rounded-lg border border-white/10 hover:border-purple-500/50 transition-all"
                    >
                      <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>
                      {post.description && (
                        <p className="text-gray-300 mb-4">{post.description}</p>
                      )}
                      <p className="text-sm text-gray-400">
                        Created: {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400 text-center py-8">
                    No posts yet. Create your first post!
                  </p>
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
    </main>
  );
}

