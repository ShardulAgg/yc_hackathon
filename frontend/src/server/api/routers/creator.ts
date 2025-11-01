import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const creatorRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const creators = await db.creator.findMany({
      orderBy: { createdAt: "desc" },
    });
    return creators;
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


