import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

const HARDCODED_CREATORS = [
  {
    id: "1",
    name: "Samantha Hayes",
    photoUrl: "/creator_media/samantha.jpg",
    bio: "Tech journalist and startup enthusiast covering YC companies. Passionate about uncovering the stories behind innovative founders building the future.",
    platform: "samanthahayes_yc",
    followers: "125K",
    createdAt: new Date("2024-01-01"),
  },
  {
    id: "2",
    name: "Grace Mitchell",
    photoUrl: "/creator_media/grace.jpg",
    bio: "AI researcher turned content creator exploring the intersection of technology and entrepreneurship. Love spotting early-stage startups solving real problems.",
    platform: "Agent_grace_mail",
    followers: "98K",
    createdAt: new Date("2024-01-02"),
  },
  {
    id: "3",
    name: "Ava Reynolds",
    photoUrl: "/creator_media/ava.jpg",
    bio: "Silicon Valley reporter documenting the startup ecosystem. Always hunting for the next breakthrough idea and the brilliant minds behind them.",
    platform: "ava_browser_brown",
    followers: "210K",
    createdAt: new Date("2024-01-03"),
  },
  {
    id: "4",
    name: "Madison Brooks",
    photoUrl: "/creator_media/madison.jpg",
    bio: "Venture capital analyst and startup interviewer. Fascinated by founders who are bold enough to tackle the world's toughest challenges.",
    platform: "madison_ai_brooks",
    followers: "156K",
    createdAt: new Date("2024-01-04"),
  },
  {
    id: "5",
    name: "Emily Carter",
    photoUrl: "/creator_media/emily.jpg",
    bio: "Y Combinator community advocate and tech storyteller. On a mission to showcase founders who are building companies that matter.",
    platform: "emily_combinator_yc",
    followers: "187K",
    createdAt: new Date("2024-01-05"),
  },
];

export const creatorRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    return HARDCODED_CREATORS;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const creator = await db.creator.findUnique({
        where: { id: input.id },
      });
      return creator;
    }),

  create: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        bio: z.string().min(1),
        photoUrl: z.string().url(),
        platform: z.string().min(1),
        followers: z.string().min(1),
      }),
    )
    .mutation(async ({ input }) => {
      const creator = await db.creator.create({
        data: input,
      });
      return creator;
    }),

  update: publicProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        bio: z.string().min(1).optional(),
        photoUrl: z.string().url().optional(),
        platform: z.string().min(1).optional(),
        followers: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ input }) => {
      const { id, ...data } = input;
      const creator = await db.creator.update({
        where: { id },
        data,
      });
      return creator;
    }),

  delete: publicProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      await db.creator.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});


