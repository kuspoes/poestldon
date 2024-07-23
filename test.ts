import { pool } from "./db.ts";
const conn = await pool.connect();

const header = {
  method: "GET",
  headers: {
    "Content-Type": "Application/json",
    Authorization: `Bearer ${Deno.env.get("GTS_TOKEN")}`,
  },
};

async function test_fetch() {
  try {
    const t = await conn.queryObject`
      SELECT post_id
      FROM test_table
      `;
    const te = t.rows;
    if (te.length == 0) {
      const f = await fetch(`${Deno.env.get("GTS_API")}`, header);
      const data = await f.json();

      for (const d of data) {
        //console.log(d.id);
        const remark = "USEND";
        conn.queryObject`
              INSERT INTO test_table
              (post_id, created_at, handler, display_name, type, remark)
              VALUES
              (${d.id}, ${d.created_at}, ${d.account.acct}, ${d.account.display_name}, ${d.type}, ${remark})
            `;
      }
    } else {
      const f = await fetch(`${Deno.env.get("GTS_API")}`, header);
      const data = await f.json();

      for (const d of data) {
        const ck = await conn.queryObject`
          SELECT EXISTS(SELECT 1 FROM test_table WHERE post_id = ${d.id})
          `;
        if (!ck.rows) {
          console.log(`${d.id} post_id sudah ada di dalam database`);
        } else {
          const remark = "USEND";
          conn.queryObject`
                INSERT INTO test_table
                (post_id, created_at, handler, display_name, type, remark)
                VALUES
                (${d.id}, ${d.created_at}, ${d.account.acct}, ${d.account.display_name}, ${d.type}, ${remark})
              `;
          console.log("sukses");
        }
      }
    }
  } catch (err) {
    console.log(err);
  }
}

test_fetch();
