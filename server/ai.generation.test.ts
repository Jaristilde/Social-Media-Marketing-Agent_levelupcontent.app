import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createAuthContext(): { ctx: TrpcContext } {
  const user: AuthenticatedUser = {
    id: 1,
    openId: "test-user",
    email: "test@example.com",
    name: "Test User",
    loginMethod: "manus",
    role: "user",
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  };

  const ctx: TrpcContext = {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };

  return { ctx };
}

describe("AI Content Generation", () => {
  it("generates caption for Instagram", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aiGenerate.caption({
      platform: "instagram",
      topic: "fitness motivation",
      tone: "inspirational",
    });

    expect(result).toHaveProperty("caption");
    expect(typeof result.caption).toBe("string");
    expect(result.caption.length).toBeGreaterThan(0);
  }, 30000);

  it("generates hashtags for TikTok", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.aiGenerate.hashtags({
      platform: "tiktok",
      topic: "fitness app",
      count: 10,
    });

    expect(result).toHaveProperty("hashtags");
    expect(typeof result.hashtags).toBe("string");
    expect(result.hashtags).toContain("#");
  }, 30000);

  it("generates content ideas", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // First create an app profile
    await caller.appProfile.upsert({
      appName: "Test Fitness App",
      appDescription: "A fitness tracking application",
      targetAudience: "Fitness enthusiasts",
    });

    const result = await caller.aiGenerate.ideas({
      platform: "both",
      count: 5,
    });

    expect(result).toHaveProperty("ideas");
    expect(typeof result.ideas).toBe("string");
    expect(result.ideas.length).toBeGreaterThan(0);
  }, 30000);
});

describe("App Profile Management", () => {
  it("creates and retrieves app profile", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.appProfile.upsert({
      appName: "Test App",
      appDescription: "Test Description",
      targetAudience: "Test Audience",
      brandVoice: "Professional",
      keywords: "test, app, keywords",
    });

    const profile = await caller.appProfile.get();

    expect(profile).toBeDefined();
    expect(profile?.appName).toBe("Test App");
    expect(profile?.appDescription).toBe("Test Description");
  });
});

describe("Content Library", () => {
  it("creates and lists content", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    await caller.content.create({
      platform: "instagram",
      contentType: "caption",
      content: "Test caption content",
      hashtags: "#test #content",
    });

    const contentList = await caller.content.list();

    expect(Array.isArray(contentList)).toBe(true);
    expect(contentList.length).toBeGreaterThan(0);
    expect(contentList[0]?.content).toBe("Test caption content");
  });

  it("deletes content", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const created = await caller.content.create({
      platform: "tiktok",
      contentType: "hashtags",
      content: "#test #hashtags",
    });

    // Ensure id is a valid number
    const contentId = typeof created.id === 'number' ? created.id : Number(created.id);
    expect(contentId).toBeGreaterThan(0);

    await caller.content.delete({ id: contentId });

    const contentList = await caller.content.list();
    const deleted = contentList.find((c) => c.id === contentId);
    expect(deleted).toBeUndefined();
  });
});
