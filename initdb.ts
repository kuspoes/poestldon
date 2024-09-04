import { Pool } from "postgres";

const db = Deno.env.get("DB_URL")!;
const pool = new Pool(db, 3, true);
const conn = await pool.connect();

async function initDb() {
  try {
    await conn.queryObject`
      CREATE TABLE testtololdon (
        id SERIAL PRIMARY KEY,
        inreplyto VARCHAR(100),
        post_id VARCHAR(100) UNIQUE,
        created_at TIMESTAMP,
        handler VARCHAR(50),
        display_name VARCHAR(256),
        type VARCHAR(20),
        status VARCHAR(10000),
        url VARCHAR(1000),
        ctext VARCHAR(10000),
        remark VARCHAR(10),
        media VARCHAR(1000)
      )
      `;
  } finally {
    conn.release();
  }
}

initDb();
