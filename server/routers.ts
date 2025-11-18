import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { invokeLLM } from "./_core/llm";
import {
  getAppProfileByUserId,
  upsertAppProfile,
  getSocialAccountsByUserId,
  createSocialAccount,
  updateSocialAccount,
  deleteSocialAccount,
  getContentByUserId,
  getContentByCampaignId,
  createContent,
  updateContent,
  deleteContent,
  getCampaignsByUserId,
  createCampaign,
  updateCampaign,
  deleteCampaign,
} from "./db";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // App Profile management
  appProfile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return await getAppProfileByUserId(ctx.user.id);
    }),
    upsert: protectedProcedure
      .input(z.object({
        appName: z.string().min(1),
        appDescription: z.string().min(1),
        targetAudience: z.string().optional(),
        brandVoice: z.string().optional(),
        keywords: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await upsertAppProfile({
          userId: ctx.user.id,
          ...input,
        });
      }),
  }),

  // Social Accounts management
  socialAccounts: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getSocialAccountsByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        platform: z.enum(["instagram", "tiktok"]),
        accountName: z.string().optional(),
        accountId: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createSocialAccount({
          userId: ctx.user.id,
          isConnected: 0,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        accountName: z.string().optional(),
        accountId: z.string().optional(),
        isConnected: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateSocialAccount(id, updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteSocialAccount(input.id);
        return { success: true };
      }),
  }),

  // AI Content Generation
  aiGenerate: router({
    caption: protectedProcedure
      .input(z.object({
        platform: z.enum(["instagram", "tiktok", "both"]),
        topic: z.string(),
        tone: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getAppProfileByUserId(ctx.user.id);
        
        const systemPrompt = profile 
          ? `You are a social media marketing expert. Generate engaging content for ${input.platform}. 
App: ${profile.appName}
Description: ${profile.appDescription}
${profile.targetAudience ? `Target Audience: ${profile.targetAudience}` : ''}
${profile.brandVoice ? `Brand Voice: ${profile.brandVoice}` : ''}
${profile.keywords ? `Keywords: ${profile.keywords}` : ''}`
          : `You are a social media marketing expert. Generate engaging content for ${input.platform}.`;

        const userPrompt = `Create a compelling ${input.platform} caption about: ${input.topic}${input.tone ? `. Tone: ${input.tone}` : ''}. Make it engaging, authentic, and optimized for ${input.platform}.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const caption = response.choices[0]?.message?.content || "";
        return { caption };
      }),
    hashtags: protectedProcedure
      .input(z.object({
        platform: z.enum(["instagram", "tiktok", "both"]),
        topic: z.string(),
        count: z.number().min(5).max(30).default(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getAppProfileByUserId(ctx.user.id);
        
        const systemPrompt = profile
          ? `You are a social media marketing expert. Generate relevant hashtags for ${input.platform}.
App: ${profile.appName}
${profile.keywords ? `Keywords: ${profile.keywords}` : ''}`
          : `You are a social media marketing expert. Generate relevant hashtags for ${input.platform}.`;

        const userPrompt = `Generate ${input.count} relevant and trending hashtags for ${input.platform} about: ${input.topic}. Return ONLY the hashtags separated by spaces, with # prefix.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const hashtags = response.choices[0]?.message?.content || "";
        return { hashtags };
      }),
    ideas: protectedProcedure
      .input(z.object({
        platform: z.enum(["instagram", "tiktok", "both"]),
        count: z.number().min(3).max(20).default(10),
      }))
      .mutation(async ({ ctx, input }) => {
        const profile = await getAppProfileByUserId(ctx.user.id);
        
        if (!profile) {
          throw new Error("Please set up your app profile first");
        }

        const systemPrompt = `You are a creative social media strategist. Generate content ideas for ${input.platform}.
App: ${profile.appName}
Description: ${profile.appDescription}
${profile.targetAudience ? `Target Audience: ${profile.targetAudience}` : ''}`;

        const userPrompt = `Generate ${input.count} creative and engaging content ideas for ${input.platform} posts. Each idea should be a brief description (1-2 sentences). Format as a numbered list.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
        });

        const ideas = response.choices[0]?.message?.content || "";
        return { ideas };
      }),
  }),

  // Content Library management
  content: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getContentByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        campaignId: z.number().optional(),
        platform: z.enum(["instagram", "tiktok", "both"]),
        contentType: z.enum(["caption", "hashtags", "idea"]),
        content: z.string(),
        hashtags: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createContent({
          userId: ctx.user.id,
          status: "draft",
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        content: z.string().optional(),
        hashtags: z.string().optional(),
        status: z.enum(["draft", "published", "archived"]).optional(),
        publishedAt: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateContent(id, updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteContent(input.id);
        return { success: true };
      }),
  }),

  // Campaigns management
  campaigns: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return await getCampaignsByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return await createCampaign({
          userId: ctx.user.id,
          status: "active",
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        status: z.enum(["active", "paused", "completed"]).optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...updates } = input;
        await updateCampaign(id, updates);
        return { success: true };
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteCampaign(input.id);
        return { success: true };
      }),
    getContent: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await getContentByCampaignId(input.id);
      }),
  }),
});

export type AppRouter = typeof appRouter;
