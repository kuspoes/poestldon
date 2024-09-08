import { pool } from "./../db.ts";

const conn = await pool.connect();

async function getPostId() {
  const getId = await conn.queryObject`
      SELECT post_id
      FROM poestololdon
      ORDER BY created_at DESC
      LIMIT 5
    `;
  const res = getId.rows;
  const resArray: string[] = res.map((i) => i.post_id);

  console.log(resArray);

  // const f = await fetch(`${Deno.env.get("GTS_API")}`, {
  //   method: "GET",
  //   headers: {
  //     "Content-Type": "Application/json",
  //     Authorization: `Bearer ${Deno.env.get("GTS_TOKEN")}`,
  //   },
  // });

  // const data = await f.json();
  // const data_id = [];
  // for await (const d of data) data_id.push(d.id);
  // // console.log("from db", id);
  // // console.log("from fetch", data_id);

  // for await (const i of id) {
  //   const check = data_id.includes(i);
  //   if (check) {
  //     console.log("sudah tersedia");
  //   } else {
  //     console.log("x");
  // }
  // }
}

getPostId();
