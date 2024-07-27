import { assertEquals, assert } from "jsr:@std/assert@1";
import { Pool } from "jsr:@bartlomieju/postgres";

interface NeonData {
  id: number;
  inreplyto: string;
  post_id: string;
  created_at: Date;
  handler: string;
  display_name: string;
  type: string;
  status: string;
  ctext: string;
  remark: string;
}

Deno.test("database", async (t) => {
  const db = Deno.env.get("DB_URL")!;
  const pool = new Pool(db, 3, true);
  const client = await pool.connect();

  await t.step("insert data", async () => {
    const u = await client.queryObject<NeonData>(
      "INSERT INTO ptldn (post_id, status) VALUES ('testid12345678', 'Testing') RETURNING *",
    );
    assertEquals(u.rows.length, 1);
    assertEquals(u.rows[0].post_id, "testid12345678");
  });

  client.end();
});

Deno.test("gotosocial fetch", async (t) => {
  const response = await fetch(`${Deno.env.get("GTS_API")}`, {
    method: "GET",
    headers: {
      "Content-Type": "Application/json",
      Authorization: `Bearer ${Deno.env.get("GTS_TOKEN")}`,
    },
  });
  assert(response.ok == true);
  assert(response.status == 200);
  assert(response.redirected == false);
  await response.body?.cancel();
});
