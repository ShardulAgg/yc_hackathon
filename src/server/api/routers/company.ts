import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";

export const companyRouter = createTRPCRouter({
  getAll: publicProcedure.query(async () => {
    const companies = await db.company.findMany({
      orderBy: { createdAt: "desc" },
    });
    return companies;
  }),

  getById: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const company = await db.company.findUnique({
        where: { id: input.id },
      });
      return company;
    }),

  getByUserId: protectedProcedure.query(async ({ ctx }) => {
    const company = await db.company.findUnique({
      where: { userId: ctx.userId },
    });
    return company;
  }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        websiteUrl: z.string().url(),
        logoUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        founderName: z.string().optional(),
        founderBio: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const company = await db.company.create({
        data: {
          ...input,
          userId: ctx.userId,
        },
      });
      return company;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        description: z.string().min(1).optional(),
        websiteUrl: z.string().url().optional(),
        logoUrl: z.string().url().optional(),
        videoUrl: z.string().url().optional(),
        founderName: z.string().optional(),
        founderBio: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the company
      const company = await db.company.findUnique({
        where: { id: input.id },
      });
      
      if (!company || company.userId !== ctx.userId) {
        throw new Error("Unauthorized");
      }
      
      const { id, ...data } = input;
      const updatedCompany = await db.company.update({
        where: { id },
        data,
      });
      return updatedCompany;
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Verify user owns the company
      const company = await db.company.findUnique({
        where: { id: input.id },
      });
      
      if (!company || company.userId !== ctx.userId) {
        throw new Error("Unauthorized");
      }
      
      await db.company.delete({
        where: { id: input.id },
      });
      return { success: true };
    }),
});

