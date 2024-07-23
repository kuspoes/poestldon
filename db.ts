import { Pool } from "postgres";
export const db = Deno.env.get("DB_URL")!;
export const pool = new Pool(db, 3, true);
