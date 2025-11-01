import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, protectedProcedure, publicProcedure } from "~/server/api/trpc";
import { db } from "~/server/db";
import { env } from "~/env";

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

  generateUseCase: protectedProcedure
    .input(
      z.object({
        websiteUrl: z.string().url(),
        companyName: z.string().min(1).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!env.PERPLEXITY_API_KEY) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Perplexity API key not configured",
        });
      }

      try {
        const prompt = `Based on the website ${input.websiteUrl}${input.companyName ? ` (Company: ${input.companyName})` : ""}${input.description ? `\nDescription: ${input.description}` : ""}, generate a concise use case description (2-3 sentences) that explains what this SaaS product is for and who should use it. Focus on the primary use case and target audience. Be specific and professional.`;

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Perplexity API error: ${response.statusText}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const useCase = data.choices?.[0]?.message?.content?.trim();

        if (!useCase) {
          throw new Error("No use case generated");
        }

        return { useCase };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate use case",
        });
      }
    }),

  generateInterestingFact: protectedProcedure
    .input(
      z.object({
        websiteUrl: z.string().url(),
        companyName: z.string().min(1).optional(),
        description: z.string().optional(),
        useCase: z.string().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      if (!env.PERPLEXITY_API_KEY) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Perplexity API key not configured",
        });
      }

      try {
        const prompt = `Based on the website ${input.websiteUrl}${input.companyName ? ` (Company: ${input.companyName})` : ""}${input.description ? `\nDescription: ${input.description}` : ""}${input.useCase ? `\nUse Case: ${input.useCase}` : ""}, generate an interesting, unique, or surprising fact about this company or product (1-2 sentences). This should be something that makes the company stand out - could be about their origin story, unique approach, notable achievement, innovative feature, or market position. Make it engaging and memorable.`;

        const response = await fetch("https://api.perplexity.ai/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.PERPLEXITY_API_KEY}`,
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            model: "sonar",
            messages: [
              {
                role: "user",
                content: prompt,
              },
            ],
            max_tokens: 200,
            temperature: 0.7,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorMessage = `Perplexity API error: ${response.statusText}`;
          try {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error?.message || errorData.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };

        const interestingFact = data.choices?.[0]?.message?.content?.trim();

        if (!interestingFact) {
          throw new Error("No interesting fact generated");
        }

        return { interestingFact };
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: error instanceof Error ? error.message : "Failed to generate interesting fact",
        });
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        websiteUrl: z.string().url(),
        useCase: z.string().min(1),
        interestingFact: z.union([z.string(), z.literal("")]).optional(),
        videoUrl: z.union([z.string().url(), z.literal("")]).optional(),
        founderName: z.union([z.string(), z.literal("")]).optional(),
        founderBio: z.union([z.string(), z.literal("")]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Clean up empty strings
      const cleanedInput = {
        ...input,
        interestingFact: input.interestingFact === "" ? undefined : input.interestingFact,
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
        useCase: z.string().min(1).optional(),
        interestingFact: z.union([z.string(), z.literal("")]).optional(),
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
        interestingFact: rest.interestingFact === "" ? undefined : rest.interestingFact,
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

