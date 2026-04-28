import { db } from "./index";
import { users } from "./schema";
import { eq } from "drizzle-orm";

export function getUserByEmail(email: string) {
  return db.select().from(users).where(eq(users.email, email.toLowerCase())).get();
}

export function getUserById(id: string) {
  return db.select().from(users).where(eq(users.id, id)).get();
}

export function acknowledgePolicy(userId: string) {
  db.update(users)
    .set({ policyAcknowledged: true, policyAcknowledgedAt: new Date() })
    .where(eq(users.id, userId))
    .run();
}

/**
 * Creates a user record on first Google login, or returns the existing one.
 * The DB record is the source of truth for role — Google only provides identity.
 */
export function upsertGoogleUser(email: string, name: string, defaultRole: string) {
  const existing = getUserByEmail(email);
  if (existing) return existing;

  const id = crypto.randomUUID();
  db.insert(users).values({
    id,
    email: email.toLowerCase(),
    passwordHash: "", // not used — Google manages authentication
    role: defaultRole,
  }).run();

  return getUserByEmail(email)!;
}

/**
 * Update a user's role. Used by admins to assign/change roles.
 */
export function setUserRole(userId: string, role: string) {
  db.update(users).set({ role }).where(eq(users.id, userId)).run();
}
