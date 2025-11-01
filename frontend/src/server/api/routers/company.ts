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
        logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
        videoUrl: z.union([z.string().url(), z.literal("")]).optional(),
        founderName: z.union([z.string(), z.literal("")]).optional(),
        founderBio: z.union([z.string(), z.literal("")]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Clean up empty strings
      const cleanedInput = {
        ...input,
        logoUrl: input.logoUrl === "" ? undefined : input.logoUrl,
        videoUrl: input.videoUrl === "" ? undefined : input.videoUrl,
        founderName: input.founderName === "" ? undefined : input.founderName,
        founderBio: input.founderBio === "" ? undefined : input.founderBio,
      };
      
      const company = await db.company.create({
        data: {
          ...cleanedInput,
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
        logoUrl: z.union([z.string().url(), z.literal("")]).optional(),
        videoUrl: z.union([z.string().url(), z.literal("")]).optional(),
        founderName: z.union([z.string(), z.literal("")]).optional(),
        founderBio: z.union([z.string(), z.literal("")]).optional(),
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
      
      // Clean up empty strings
      const { id, ...rest } = input;
      const cleanedData = {
        ...rest,
        logoUrl: rest.logoUrl === "" ? undefined : rest.logoUrl,
        videoUrl: rest.videoUrl === "" ? undefined : rest.videoUrl,
        founderName: rest.founderName === "" ? undefined : rest.founderName,
        founderBio: rest.founderBio === "" ? undefined : rest.founderBio,
      };
      
      // Remove undefined fields
      const updateData = Object.fromEntries(
        Object.entries(cleanedData).filter(([_, v]) => v !== undefined)
      );
      
      const updatedCompany = await db.company.update({
        where: { id },
        data: updateData,
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

