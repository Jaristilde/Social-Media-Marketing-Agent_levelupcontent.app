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

describe("Campaign Management", () => {
  it("creates a new campaign", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    const result = await caller.campaigns.create({
      name: "Summer Launch",
      description: "Summer product launch campaign",
      startDate: new Date("2025-06-01"),
      endDate: new Date("2025-08-31"),
    });

    expect(result).toBeDefined();
    expect(result.id).toBeDefined();
    expect(result.name).toBe("Summer Launch");
    expect(result.description).toBe("Summer product launch campaign");
    expect(result.status).toBe("active");
  });

  it("lists all campaigns", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a campaign first
    await caller.campaigns.create({
      name: "Test Campaign",
      description: "Test description",
    });

    const campaigns = await caller.campaigns.list();

    expect(Array.isArray(campaigns)).toBe(true);
    expect(campaigns.length).toBeGreaterThan(0);
  });

  it("gets campaign by ID", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a campaign
    const created = await caller.campaigns.create({
      name: "Get By ID Test",
      description: "Testing get by ID",
    });

    expect(created.id).toBeDefined();
    const campaignId = created.id;

    // Get the campaign
    const campaign = await caller.campaigns.getById({ id: campaignId });

    expect(campaign).toBeDefined();
    expect(campaign?.name).toBe("Get By ID Test");
  });

  it("updates a campaign", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a campaign
    const created = await caller.campaigns.create({
      name: "Update Test",
      description: "Original description",
    });

    expect(created.id).toBeDefined();
    const campaignId = created.id;

    // Update the campaign
    await caller.campaigns.update({
      id: campaignId,
      name: "Updated Name",
      description: "Updated description",
      status: "paused",
    });

    // Verify update by fetching the campaign
    const updated = await caller.campaigns.getById({ id: campaignId });
    expect(updated?.name).toBe("Updated Name");
    expect(updated?.description).toBe("Updated description");
    expect(updated?.status).toBe("paused");
  });

  it("deletes a campaign", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a campaign
    const created = await caller.campaigns.create({
      name: "Delete Test",
    });

    expect(created.id).toBeDefined();
    const campaignId = created.id;

    // Delete the campaign
    await caller.campaigns.delete({ id: campaignId });

    // Verify it's deleted
    const campaign = await caller.campaigns.getById({ id: campaignId });
    expect(campaign).toBeUndefined();
  });

  it("assigns content to campaign", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create a campaign
    const campaign = await caller.campaigns.create({
      name: "Assignment Test",
    });
    expect(campaign.id).toBeDefined();
    const campaignId = campaign.id;

    // Create content
    const content = await caller.content.create({
      platform: "instagram",
      contentType: "caption",
      content: "Test caption for assignment",
      hashtags: "#test",
    });
    expect(content.id).toBeDefined();
    const contentId = content.id!;

    // Assign content to campaign
    const result = await caller.campaigns.assignContent({
      contentId,
      campaignId,
    });

    expect(result.success).toBe(true);

    // Verify assignment
    const campaignContent = await caller.campaigns.getContent({ id: campaignId });
    expect(campaignContent.length).toBeGreaterThan(0);
    expect(campaignContent.some(c => c.id === contentId)).toBe(true);
  });

  it("removes content from campaign", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create campaign and content
    const campaign = await caller.campaigns.create({
      name: "Removal Test",
    });
    expect(campaign.id).toBeDefined();
    const campaignId = campaign.id;

    const content = await caller.content.create({
      platform: "tiktok",
      contentType: "idea",
      content: "Test idea for removal",
    });
    expect(content.id).toBeDefined();
    const contentId = content.id!;

    // Assign content
    await caller.campaigns.assignContent({
      contentId,
      campaignId,
    });

    // Remove content from campaign
    const result = await caller.campaigns.assignContent({
      contentId,
      campaignId: null,
    });

    expect(result.success).toBe(true);

    // Verify removal
    const campaignContent = await caller.campaigns.getContent({ id: campaignId });
    expect(campaignContent.some(c => c.id === contentId)).toBe(false);
  });

  it("gets campaign content with correct metrics", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create campaign
    const campaign = await caller.campaigns.create({
      name: "Metrics Test",
    });
    expect(campaign.id).toBeDefined();
    const campaignId = campaign.id;

    // Create multiple content items
    const content1 = await caller.content.create({
      platform: "instagram",
      contentType: "caption",
      content: "Draft content",
    });
    // Keep as draft (default)

    const content2 = await caller.content.create({
      platform: "instagram",
      contentType: "caption",
      content: "Published content",
    });
    // Update to published
    await caller.content.update({
      id: content2.id!,
      status: "published",
    });

    const content3 = await caller.content.create({
      platform: "tiktok",
      contentType: "hashtags",
      content: "#archived",
    });
    // Update to archived
    await caller.content.update({
      id: content3.id!,
      status: "archived",
    });

    // Assign all to campaign
    await caller.campaigns.assignContent({
      contentId: content1.id!,
      campaignId,
    });

    await caller.campaigns.assignContent({
      contentId: content2.id!,
      campaignId,
    });

    await caller.campaigns.assignContent({
      contentId: content3.id!,
      campaignId,
    });

    // Get campaign content
    const campaignContent = await caller.campaigns.getContent({ id: campaignId });

    // Verify we have at least the 3 items we added
    expect(campaignContent.length).toBeGreaterThanOrEqual(3);
    
    // Count items with our specific IDs
    const ourContent = campaignContent.filter(c => 
      [content1.id, content2.id, content3.id].includes(c.id)
    );
    
    expect(ourContent.length).toBe(3);
    expect(ourContent.filter(c => c.status === "draft").length).toBe(1);
    expect(ourContent.filter(c => c.status === "published").length).toBe(1);
    expect(ourContent.filter(c => c.status === "archived").length).toBe(1);
  });

  it("handles campaign with no content", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create empty campaign
    const campaign = await caller.campaigns.create({
      name: "Empty Campaign",
    });
    expect(campaign.id).toBeDefined();
    const campaignId = campaign.id;

    // Get content (should be empty)
    const content = await caller.campaigns.getContent({ id: campaignId });

    expect(Array.isArray(content)).toBe(true);
    expect(content.length).toBe(0);
  });

  it("updates campaign status", async () => {
    const { ctx } = createAuthContext();
    const caller = appRouter.createCaller(ctx);

    // Create campaign
    const created = await caller.campaigns.create({
      name: "Status Test",
    });
    expect(created.id).toBeDefined();
    const campaignId = created.id;

    // Update to paused
    await caller.campaigns.update({
      id: campaignId,
      status: "paused",
    });

    let campaign = await caller.campaigns.getById({ id: campaignId });
    expect(campaign?.status).toBe("paused");

    // Update to completed
    await caller.campaigns.update({
      id: campaignId,
      status: "completed",
    });

    campaign = await caller.campaigns.getById({ id: campaignId });
    expect(campaign?.status).toBe("completed");
  });
});
