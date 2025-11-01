import { TRPCError } from "@trpc/server";
import { z } from "zod";
import crypto from "crypto";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { env } from "~/env";
import { db } from "~/server/db";

// Video agent API base URL - defaults to localhost:8000 in development
const VIDEO_AGENT_API_URL = env.VIDEO_AGENT_API_URL || "http://localhost:8000";

// Map video agent creator ID (0-4) to database creator ID (string)
const CREATOR_ID_MAP: Record<number, string> = {
  0: "1", // Samantha Hayes
  1: "2", // Grace Mitchell
  2: "3", // Ava Reynolds
  3: "4", // Madison Brooks
  4: "5", // Emily Carter
};

export const videoRouter = createTRPCRouter({
  getCreators: publicProcedure.query(async () => {
    try {
      const response = await fetch(`${VIDEO_AGENT_API_URL}/api/creators`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch creators: ${response.statusText}`,
        });
      }

      const creators = (await response.json()) as Array<{
        id: number;
        name: string;
        image: string;
      }>;

      return creators;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to fetch creators",
      });
    }
  }),

  generateVideo: protectedProcedure
    .input(
      z.object({
        company_id: z.string(),
        company_name: z.string().min(1),
        use_case: z.string().min(1),
        founder_name: z.string().min(1),
        founder_role: z.string().min(1),
        interesting_context: z.string(),
        creator_id: z.number().int().min(0),
        force_regenerate: z.boolean().optional().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify company exists and belongs to user
        const company = await db.company.findUnique({
          where: { id: input.company_id },
        });

        if (!company || company.userId !== ctx.userId) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "Company not found or unauthorized",
          });
        }

        const dbCreatorId = CREATOR_ID_MAP[input.creator_id];
        if (!dbCreatorId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid creator_id",
          });
        }

        // Create a hash of the company information to detect changes
        const companyInfoHash = crypto
          .createHash("sha256")
          .update(
            JSON.stringify({
              company_name: input.company_name,
              use_case: input.use_case,
              founder_name: input.founder_name,
              founder_role: input.founder_role,
              interesting_context: input.interesting_context,
            })
          )
          .digest("hex");

        // Check if a video already exists for this company+creator combination
        // and if the company info hasn't changed
        if (!input.force_regenerate) {
          const existingPost = await db.post.findFirst({
            where: {
              companyId: input.company_id,
              creatorId: dbCreatorId,
              userId: ctx.userId,
            },
            include: {
              videos: true,
              company: true,
            },
            orderBy: { createdAt: "desc" },
          });

          if (existingPost && existingPost.videos.length > 0) {
            // Check if company info has changed by comparing with stored hash
            // We'll store the hash in the description for now (in production, use a proper metadata field)
            const storedHash = existingPost.description?.match(/\[HASH:([a-f0-9]+)\]/)?.[1];
            
            if (storedHash === companyInfoHash) {
              // Company info hasn't changed, return existing video
              return {
                message: "Using cached video",
                status: "completed",
                video_id: existingPost.id,
                video_url: existingPost.videos[0]!.url,
                input: {
                  company_name: input.company_name,
                  use_case: input.use_case,
                  founder_name: input.founder_name,
                  founder_role: input.founder_role,
                  interesting_context: input.interesting_context,
                },
                postId: existingPost.id,
                cached: true,
              };
            }
            
            // Company info has changed, delete old video post to regenerate
            await db.post.delete({
              where: { id: existingPost.id },
            });
          }
        }

        // Call video agent API
        const response = await fetch(`${VIDEO_AGENT_API_URL}/api/generate`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            company_name: input.company_name,
            use_case: input.use_case,
            founder_name: input.founder_name,
            founder_role: input.founder_role,
            interesting_context: input.interesting_context,
            creator_id: input.creator_id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new TRPCError({
            code: "BAD_REQUEST",
            message:
              errorData.detail ||
              errorData.message ||
              `Failed to generate video: ${response.statusText}`,
          });
        }

        const result = (await response.json()) as {
          message: string;
          status: string;
          input: Record<string, unknown>;
          video_url: string;
          video_id?: string;
          error?: string;
        };

        // Handle video_url - it might be a real MP4 URL or placeholder
        // If it's a real MP4 URL (starts with http or /), use it directly
        // If it's placeholder.mp4, still save it so it appears in the list
        let videoUrlToStore = result.video_url;
        
        // Normalize the video URL for storage
        if (result.video_url && result.video_url !== "placeholder.mp4") {
          // If it's a relative path, make it absolute to the backend API
          if (result.video_url.startsWith("/")) {
            videoUrlToStore = `${VIDEO_AGENT_API_URL}${result.video_url}`;
          }
          // If it already starts with http, use it as is
          // Otherwise assume it's a valid URL
        }

        // Save video as Post - always save, even if it's a placeholder
        // This allows users to see all generated videos
        if (dbCreatorId && result.video_url) {
          // Create post with video, including hash in description for change detection
          const descriptionText = `Video generated for ${input.company_name}. Use case: ${input.use_case}${input.interesting_context ? `. ${input.interesting_context}` : ""} [HASH:${companyInfoHash}]`;
          
          const post = await db.post.create({
            data: {
              title: `Generated Video: ${input.company_name} by ${input.founder_name}`,
              description: descriptionText,
              userId: ctx.userId,
              companyId: input.company_id,
              creatorId: dbCreatorId,
              videos: {
                create: {
                  url: videoUrlToStore,
                },
              },
            },
          });

          return {
            ...result,
            postId: post.id,
          };
        }

        return result;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message:
            error instanceof Error
              ? error.message
              : "Failed to generate video",
        });
      }
    }),

  getVideosByCreator: publicProcedure
    .input(z.object({ creatorId: z.string() }))
    .query(async ({ input }) => {
      // First try to get videos from database (frontend-generated)
      const posts = await db.post.findMany({
        where: {
          creatorId: input.creatorId,
        },
        include: {
          videos: true,
          images: true,
          company: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      // Also fetch videos from backend API
      try {
        // Map database creator ID to video agent creator ID (reverse of CREATOR_ID_MAP)
        const CREATOR_ID_REVERSE_MAP: Record<string, number> = {
          "1": 0, // Samantha Hayes
          "2": 1, // Grace Mitchell
          "3": 2, // Ava Reynolds
          "4": 3, // Madison Brooks
          "5": 4, // Emily Carter
        };

        const backendCreatorId = CREATOR_ID_REVERSE_MAP[input.creatorId];
        
        if (backendCreatorId !== undefined) {
          const response = await fetch(
            `${VIDEO_AGENT_API_URL}/api/videos?creator_id=${backendCreatorId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          if (response.ok) {
            const backendVideos = (await response.json()) as Array<{
              id: string;
              company_name: string;
              founder_name: string;
              creator_id: number;
              creator_name: string;
              video_url: string;
              status: string;
              created_at: string;
              metadata: Record<string, unknown>;
            }>;

            // Convert backend videos to match post format for display
            const backendPosts = backendVideos.map((video) => {
              // Handle different video_url formats:
              // 1. Full HTTP URL - use as is
              // 2. Path starting with /api/videos/... - prepend API URL
              // 3. placeholder.mp4 - keep as is (will show placeholder UI)
              let videoUrl = video.video_url;
              if (video.video_url.startsWith("http")) {
                videoUrl = video.video_url;
              } else if (video.video_url.startsWith("/")) {
                videoUrl = `${VIDEO_AGENT_API_URL}${video.video_url}`;
              } else if (video.video_url === "placeholder.mp4") {
                videoUrl = "placeholder.mp4";
              }
              
              return {
                id: `backend-${video.id}`,
                title: `Generated Video: ${video.company_name} by ${video.founder_name}`,
                description: `Video generated for ${video.company_name}`,
                createdAt: new Date(video.created_at),
                updatedAt: new Date(video.created_at),
                userId: "",
                companyId: "",
                creatorId: input.creatorId,
                videos: [
                  {
                    id: video.id,
                    url: videoUrl,
                    postId: `backend-${video.id}`,
                    createdAt: new Date(video.created_at),
                  },
                ],
                images: [],
                company: {
                  id: "",
                  name: video.company_name,
                },
              };
            });

            // Combine and sort by date
            const allPosts = [...posts, ...backendPosts];
            allPosts.sort(
              (a, b) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            return allPosts;
          }
        }
      } catch (error) {
        console.error("Failed to fetch videos from backend API:", error);
        // Continue with just database posts if backend fails
      }

      return posts;
    }),

  getAllBackendVideos: publicProcedure.query(async () => {
    try {
      const response = await fetch(`${VIDEO_AGENT_API_URL}/api/videos`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: `Failed to fetch videos: ${response.statusText}`,
        });
      }

      const videos = (await response.json()) as Array<{
        id: string;
        company_name: string;
        founder_name: string;
        creator_id: number;
        creator_name: string;
        video_url: string;
        status: string;
        created_at: string;
        metadata: Record<string, unknown>;
      }>;

      return videos;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message:
          error instanceof Error ? error.message : "Failed to fetch videos",
      });
    }
  }),
});

