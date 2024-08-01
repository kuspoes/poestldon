import { pool } from "./db.ts";
import { NeonData } from "./NeonData.ts"

const conn = await pool.connect();

// Test Query
try {
  const r = await conn.queryObject`
      SELECT post_id FROM poestololdon
      WHERE post_id NOT IN(
        (SELECT post_id FROM poestololdon ORDER BY created_at DESC LIMIT 5)
      )
    `;
  console.log(r.rows.length);
} catch(err) {
  console.log(err)
}
