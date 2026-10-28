import "server-only";

import { createHash } from "node:crypto";
import { getMongoDatabase } from "@/lib/mongodb";

function hashPassword(password: string): string {
  return createHash("md5").update(password).digest("hex");
}

async function main() {
  const database = await getMongoDatabase();

  const username = process.env.AUTH_ADMIN_USERNAME ?? "admin";
  const password = process.env.AUTH_ADMIN_PASSWORD ?? "admin123";
  const role = process.env.AUTH_ADMIN_ROLE ?? "admin";

  const existing = await database.collection("auth_users").findOne({ username });
  if (existing) {
    console.log(`User "${username}" already exists — skipping seed.`);
    return;
  }

  await database.collection("auth_users").insertOne({
    id: `auth_user_${username}`,
    username,
    password: hashPassword(password),
    role,
    active: true,
    ef: new Date(),
    et: new Date(),
  });

  console.log(`Seeded auth user "${username}" (role: ${role}).`);
}

main().catch((error) => {
  console.error("Failed to seed auth user:", error);
  process.exitCode = 1;
});