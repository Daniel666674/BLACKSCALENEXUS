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
