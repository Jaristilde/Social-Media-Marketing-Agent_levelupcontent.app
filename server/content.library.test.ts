import { describe, expect, it, beforeEach } from "vitest";
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

describe("Content Library Features", () => {
  let testContentId: number;

  beforeEach(async () => {
    // Create a test content item for each test
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);
    
    const created = await caller.content.create({
      platform: "instagram",
      contentType: "caption",
      content: "Test content for library",
      hashtags: "#test #library",
      status: "draft",
    });
    
    testContentId = created.id;
  });

  describe("Content CRUD Operations", () => {
    it("creates content with all fields", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.content.create({
        platform: "tiktok",
        contentType: "hashtags",
        content: "#viral #trending #fyp",
        status: "draft",
      });

      expect(result).toHaveProperty("id");
      expect(result.id).toBeGreaterThan(0);
    });

    it("lists all content for user", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const list = await caller.content.list();

      expect(Array.isArray(list)).toBe(true);
      expect(list.length).toBeGreaterThan(0);
      expect(list[0]).toHaveProperty("platform");
      expect(list[0]).toHaveProperty("contentType");
      expect(list[0]).toHaveProperty("status");
    });

    it("updates content fields", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await caller.content.update({
        id: testContentId,
        content: "Updated content text",
        status: "published",
      });

      const list = await caller.content.list();
      const updated = list.find((c) => c.id === testContentId);

      expect(updated).toBeDefined();
      expect(updated?.content).toBe("Updated content text");
      expect(updated?.status).toBe("published");
    });

    it("deletes content by id", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await caller.content.delete({ id: testContentId });

      const list = await caller.content.list();
      const deleted = list.find((c) => c.id === testContentId);

      expect(deleted).toBeUndefined();
    });
  });

  describe("Content Status Management", () => {
    it("creates content with draft status by default", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.content.create({
        platform: "instagram",
        contentType: "caption",
        content: "Draft content",
      });

      const list = await caller.content.list();
      const created = list.find((c) => c.id === result.id);

      expect(created?.status).toBe("draft");
    });

    it("updates content status to published", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await caller.content.update({
        id: testContentId,
        status: "published",
      });

      const list = await caller.content.list();
      const updated = list.find((c) => c.id === testContentId);

      expect(updated?.status).toBe("published");
    });

    it("updates content status to archived", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await caller.content.update({
        id: testContentId,
        status: "archived",
      });

      const list = await caller.content.list();
      const updated = list.find((c) => c.id === testContentId);

      expect(updated?.status).toBe("archived");
    });
  });

  describe("Content Platform Support", () => {
    it("creates Instagram content", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.content.create({
        platform: "instagram",
        contentType: "caption",
        content: "Instagram post caption",
      });

      expect(result.platform).toBe("instagram");
    });

    it("creates TikTok content", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.content.create({
        platform: "tiktok",
        contentType: "idea",
        content: "TikTok video idea",
      });

      expect(result.platform).toBe("tiktok");
    });

    it("creates content for both platforms", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.content.create({
        platform: "both",
        contentType: "hashtags",
        content: "#universal #hashtags",
      });

      expect(result.platform).toBe("both");
    });
  });

  describe("Content Type Support", () => {
    it("creates caption type content", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.content.create({
        platform: "instagram",
        contentType: "caption",
        content: "Caption text here",
      });

      expect(result.contentType).toBe("caption");
    });

    it("creates hashtags type content", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.content.create({
        platform: "tiktok",
        contentType: "hashtags",
        content: "#hashtag1 #hashtag2",
      });

      expect(result.contentType).toBe("hashtags");
    });

    it("creates idea type content", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.content.create({
        platform: "instagram",
        contentType: "idea",
        content: "Content idea description",
      });

      expect(result.contentType).toBe("idea");
    });
  });

  describe("Bulk Operations", () => {
    it("handles multiple content items", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create multiple items
      await Promise.all([
        caller.content.create({
          platform: "instagram",
          contentType: "caption",
          content: "Item 1",
        }),
        caller.content.create({
          platform: "tiktok",
          contentType: "caption",
          content: "Item 2",
        }),
        caller.content.create({
          platform: "both",
          contentType: "hashtags",
          content: "#bulk #test",
        }),
      ]);

      const list = await caller.content.list();
      expect(list.length).toBeGreaterThanOrEqual(4); // Including beforeEach item
    });

    it("deletes multiple items sequentially", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      // Create items to delete
      const item1 = await caller.content.create({
        platform: "instagram",
        contentType: "caption",
        content: "Delete me 1",
      });
      const item2 = await caller.content.create({
        platform: "tiktok",
        contentType: "caption",
        content: "Delete me 2",
      });

      // Delete both
      await caller.content.delete({ id: item1.id });
      await caller.content.delete({ id: item2.id });

      const list = await caller.content.list();
      const found1 = list.find((c) => c.id === item1.id);
      const found2 = list.find((c) => c.id === item2.id);

      expect(found1).toBeUndefined();
      expect(found2).toBeUndefined();
    });
  });

  describe("Content with Hashtags", () => {
    it("stores hashtags with content", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      const result = await caller.content.create({
        platform: "instagram",
        contentType: "caption",
        content: "Caption with hashtags",
        hashtags: "#test #vitest #automation",
      });

      const list = await caller.content.list();
      const created = list.find((c) => c.id === result.id);

      expect(created?.hashtags).toBe("#test #vitest #automation");
    });

    it("updates hashtags independently", async () => {
      const { ctx } = createAuthContext();
      const caller = appRouter.createCaller(ctx);

      await caller.content.update({
        id: testContentId,
        hashtags: "#updated #hashtags",
      });

      const list = await caller.content.list();
      const updated = list.find((c) => c.id === testContentId);

      expect(updated?.hashtags).toBe("#updated #hashtags");
    });
  });
});
