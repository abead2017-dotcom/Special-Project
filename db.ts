import { eq, gte, lte } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, accounts, purchases, reviews, InsertAccount, InsertPurchase } from "../drizzle/schema";
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

/**
 * Get all active accounts with optional filtering
 */
export async function getActiveAccounts(filters?: {
  type?: string;
  minFollowers?: number;
  maxFollowers?: number;
  minPrice?: number;
  maxPrice?: number;
  searchQuery?: string;
}) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(accounts.status, 'active')];

  if (filters?.type) {
    conditions.push(eq(accounts.type, filters.type as any));
  }
  if (filters?.minFollowers) {
    conditions.push(gte(accounts.followers, filters.minFollowers));
  }
  if (filters?.maxFollowers) {
    conditions.push(lte(accounts.followers, filters.maxFollowers));
  }
  if (filters?.minPrice) {
    conditions.push(gte(accounts.price, filters.minPrice));
  }
  if (filters?.maxPrice) {
    conditions.push(lte(accounts.price, filters.maxPrice));
  }

  const { and } = await import('drizzle-orm');
  const results = await db.select().from(accounts).where(and(...conditions));
  return results;
}

/**
 * Get a single account by ID
 */
export async function getAccountById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(accounts).where(eq(accounts.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Get accounts by seller ID
 */
export async function getAccountsBySellerId(sellerId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(accounts).where(eq(accounts.sellerId, sellerId));
}

/**
 * Create a new account listing
 */
export async function createAccount(data: InsertAccount) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  const result = await db.insert(accounts).values(data);
  return result;
}

/**
 * Update an account
 */
export async function updateAccount(id: number, data: Partial<InsertAccount>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.update(accounts).set(data).where(eq(accounts.id, id));
}

/**
 * Get user's purchase history
 */
export async function getUserPurchases(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(purchases).where(eq(purchases.buyerId, userId));
}

/**
 * Get user's sales history
 */
export async function getUserSales(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(purchases).where(eq(purchases.sellerId, userId));
}

/**
 * Create a purchase record
 */
export async function createPurchase(data: InsertPurchase) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');

  return db.insert(purchases).values(data);
}

/**
 * Get account reviews
 */
export async function getAccountReviews(accountId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(reviews).where(eq(reviews.accountId, accountId));
}
