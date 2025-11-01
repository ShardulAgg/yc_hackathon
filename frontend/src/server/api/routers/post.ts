import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const postRouter = createTRPCRouter({
  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    const posts = await db.post.findMany({
      where: { userId: ctx.userId },
      include: {
        images: true,
        videos: true,
      },
      orderBy: { createdAt: "desc" },
    });
    return posts;
  }),

  getByCompanyId: publicProcedure
    .input(z.object({ companyId: z.string() }))
    .query(async ({ input }) => {
      const posts = await db.post.findMany({
        where: { companyId: input.companyId },
        include: {
          images: true,
          videos: true,
        },
        orderBy: { createdAt: "desc" },
      });
      return posts;
    }),

  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get user's company
      const company = await db.company.findUnique({
        where: { userId: ctx.userId },
      });

      if (!company) {
        throw new Error("No company found for this user");
      }

      const post = await db.post.create({
        data: {
          title: input.title,
          description: input.description,
          userId: ctx.userId,
          companyId: company.id,
        },
      });

      return post;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the post
      const post = await db.post.findUnique({
        where: { id: input.id },
      });

      if (!post || post.userId !== ctx.userId) {
        throw new Error("Unauthorized");
      }

      await db.post.delete({
        where: { id: input.id },
      });

      return { success: true };
    }),
});
