import { pool } from "./../db.ts";
import { NeonData } from "./../NeonData.ts";
import TurndownService from "turndown";

const conn = await pool.connect();

async function requestNotif() {
  try {
    const f = await fetch(`${Deno.env.get("GTS_API")}`, {
      method: "GET",
      headers: {
        "Content-Type": "Application/json",
        Authorization: `Bearer ${Deno.env.get("GTS_TOKEN")}`,
      },
    });

    const data = await f.json();
    //console.log(data);

    for (const d of data) {
      const remark: string = "USEND";
      let inreply: string;
      let content: string;
      if (d.type === "follow") {
        inreply = "null";
        content = "null";
      } else {
        inreply = d.status.in_reply_to_id;
        content = d.status.content;
      }

      //console.log(d.status.media_attachments);
      for (const m of d.status.media_attachments) {
        // const mediaUrl = m.url;

        await conn.queryObject<NeonData>`
          INSERT INTO testtololdon
          (inreplyto, post_id, created_at, handler, display_name, type, status, url, remark, media)
          VALUES
          (${inreply}, ${d.id}, ${d.created_at}, ${d.account.acct}, ${d.account.display_name}, ${d.type}, ${content}, ${d.status.url}, ${remark}, ${mediaUrl} )
          ON CONFLICT (post_id) DO NOTHING`;
      }
    }
  } catch (err) {
    console.log(err);
  }
}

requestNotif();
