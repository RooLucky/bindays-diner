import "dotenv/config";

import { neon } from "@neondatabase/serverless";

import { getServerEnv } from "@/lib/env";

async function resetDb() {
  const sql = neon(getServerEnv().DATABASE_URL);

  await sql`drop schema if exists public cascade`;
  await sql`create schema public`;
  await sql`grant usage, create on schema public to public`;

  console.log("Database reset: dropped and recreated public schema.");
}

resetDb().catch((error) => {
  console.error(error);
  process.exit(1);
});
