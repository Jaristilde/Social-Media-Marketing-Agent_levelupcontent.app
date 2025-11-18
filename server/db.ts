import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  appProfiles, InsertAppProfile,
  socialAccounts, InsertSocialAccount,
  contentLibrary, InsertContentLibrary,
  campaigns, InsertCampaign
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// App Profile queries
export async function getAppProfileByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(appProfiles).where(eq(appProfiles.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertAppProfile(profile: InsertAppProfile) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getAppProfileByUserId(profile.userId);
  if (existing) {
    await db.update(appProfiles).set(profile).where(eq(appProfiles.userId, profile.userId));
    return { ...existing, ...profile };
  } else {
    const result = await db.insert(appProfiles).values(profile) as any;
    return { id: Number(result.insertId), ...profile };
  }
}

// Social Account queries
export async function getSocialAccountsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(socialAccounts).where(eq(socialAccounts.userId, userId));
}

export async function createSocialAccount(account: InsertSocialAccount) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(socialAccounts).values(account) as any;
  return { id: Number(result.insertId), ...account };
}

export async function updateSocialAccount(id: number, updates: Partial<InsertSocialAccount>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(socialAccounts).set(updates).where(eq(socialAccounts.id, id));
}

export async function deleteSocialAccount(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(socialAccounts).where(eq(socialAccounts.id, id));
}

// Content Library queries
export async function getContentByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contentLibrary).where(eq(contentLibrary.userId, userId)).orderBy(desc(contentLibrary.createdAt));
}

export async function getContentByCampaignId(campaignId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(contentLibrary).where(eq(contentLibrary.campaignId, campaignId));
}

export async function createContent(content: InsertContentLibrary) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(contentLibrary).values(content) as any;
  const insertId = result.insertId || result[0]?.insertId;
  if (!insertId) throw new Error("Failed to get insert ID");
  return { id: Number(insertId), ...content };
}

export async function updateContent(id: number, updates: Partial<InsertContentLibrary>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(contentLibrary).set(updates).where(eq(contentLibrary.id, id));
}

export async function deleteContent(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(contentLibrary).where(eq(contentLibrary.id, id));
}

// Campaign queries
export async function getCampaignsByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(campaigns).where(eq(campaigns.userId, userId)).orderBy(desc(campaigns.createdAt));
}

export async function createCampaign(campaign: InsertCampaign) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(campaigns).values(campaign) as any;
  return { id: Number(result.insertId), ...campaign };
}

export async function updateCampaign(id: number, updates: Partial<InsertCampaign>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(campaigns).set(updates).where(eq(campaigns.id, id));
}

export async function deleteCampaign(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(campaigns).where(eq(campaigns.id, id));
}
