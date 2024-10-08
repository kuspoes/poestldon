import { pool } from "./db.ts";
import { NeonData, NeonIdData } from "./NeonData.ts";
import TurndownService from "turndown";

const conn = await pool.connect();

async function requestNotif() {
  try {
    const getId = await conn.queryObject<NeonIdData>`
        SELECT post_id
        FROM poeskoclokdon
        ORDER BY id DESC
        LIMIT 10
      `;
    const res = getId.rows;

    const id: string[] = [];
    for await (const r of res) id.push(r.post_id);

    const f = await fetch(`${Deno.env.get("GTS_API")}`, {
      method: "GET",
      headers: {
        "Content-Type": "Application/json",
        Authorization: `Bearer ${Deno.env.get("GTS_TOKEN")}`,
      },
    });

    const data = await f.json();
    const data_id: string[] = [];
    for await (const d of data) data_id.push(d.id);

    for await (const i of id) {
      const check = data_id.includes(i);
      if (check) {
        console.log("data sudah ada");
      } else {
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

          if (d.type === "follow") {
            conn.queryObject<NeonData>`
                INSERT INTO poestololdon
                (post_id, created_at, handler, display_name, type, remark)
                VALUES
                (${d.id}, ${d.created_at}, ${d.account.acct}, ${d.account.display_name}, ${d.type}, ${remark})
                ON CONFLICT (post_id) DO NOTHING
              `;
          } else {
            conn.queryObject<NeonData>`
                INSERT INTO poestololdon
                (inreplyto, post_id, created_at, handler, display_name, type, status, url, remark)
                VALUES
                (${inreply}, ${d.id}, ${d.created_at}, ${d.account.acct}, ${d.account.display_name}, ${d.type}, ${content}, ${d.status.url}, ${remark})
                ON CONFLICT (post_id) DO NOTHING
              `;
          }
          await conn.queryObject<NeonIdData>`
            INSERT INTO poeskoclokdon
            (post_id)
            VALUES
            (${d.id})
            ON CONFLICT (post_id) DO NOTHING
          `;
        }
      } // else
    }
  } catch (err) {
    console.log(err);
  }
}

async function sendNotif() {
  try {
    const query = await conn.queryObject<NeonData>`
    SELECT * FROM poestololdon
    WHERE remark = 'USEND'
    ORDER BY created_at ASC
    `;
    const data = query.rows;
    //console.log(data);

    for (const d of data) {
      let flag;
      if (d.type === "follow") {
        flag = "✋";
      } else if (d.type === "mention") {
        flag = "💬";
      } else if (d.type === "reblog") {
        flag = "🚀";
      } else if (d.type === "favourite") {
        flag = "💖";
      }

      if (d.type === "follow") {
        await fetch(
          `https://api.telegram.org/bot${Deno.env.get("TELE_BOT")}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "Application/json",
            },
            body: JSON.stringify({
              chat_id: `${Deno.env.get("TELE_CHATID")}`,
              parse_mode: "Markdown",
              text: `*${d.display_name}*
_${d.handler}_
${flag} ${d.type} you!
`,
            }),
          },
        );
      } else {
        //console.log("not follow");
        let link: string;
        if (d.type != "mention") {
          link = d.url;
        } else {
          link = `https://kauaku.us/@poes/statuses/${d.inreplyto}`;
          //link = `https://dev.phanpy.social/#/kauaku.us/s/${d.inreplyto}`;
        }

        const td = new TurndownService();
        td.addRule("Remove link", {
          filter: ["a"],
          replacement: function (content: string) {
            return "**" + content + "**";
          },
        });

        const t_content = td.turndown(d.status);
        //console.log(t_content);

        await fetch(
          `https://api.telegram.org/bot${Deno.env.get("TELE_BOT")}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "Application/json",
            },
            body: JSON.stringify({
              chat_id: `${Deno.env.get("TELE_CHATID")}`,
              parse_mode: "Markdown",
              text: `*${d.display_name}*
_${d.handler}_
${flag}  ${d.type} your post!

❝${t_content}❞

[source](${link})

`,
            }),
          },
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}

async function markNotif() {
  try {
    await conn.queryObject<NeonData>`
      UPDATE poestololdon
      SET remark = 'SEND'
      `;
  } catch (err) {
    console.log(err);
  }
}

async function deleteNotif() {
  try {
    await conn.queryObject<NeonData>`
      DROP TABLE poestololdon;
      CREATE TABLE poestololdon (
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
        remark VARCHAR(10)),
        media VARCHAR(1000),
      `;

    await conn.queryObject`
      DROP TABLE poeskoclokdon;
      CREATE TABLE poeskoclokdon(
        id SERIAL PRIMARY KEY,
        post_id VARCHAR(100) UNIQUE)
      `;
    await requestNotif();
    await markNotif();
  } catch (err) {
    console.log(err);
  }
}

async function sendLogTele(msg: string) {
  try {
    const kapan = Date();
    await fetch(
      `https://api.telegram.org/bot${Deno.env.get("TELE_BOT")}/sendMessage`,
      {
        method: "POST",
        headers: {
          "Content-Type": "Application/json",
        },
        body: JSON.stringify({
          chat_id: `${Deno.env.get("TELE_CHATID")}`,
          parse_mode: "Markdown",
          text: `🔥 *Info*
  ${msg}
  ${kapan}
          `,
        }),
      },
    );
  } catch (err) {
    console.log(err);
  }
}

// Deno.cron("Notifikasi", "*/3 * * * *", () => {
//   requestNotif();

//   setTimeout(() => {
//     sendNotif();
//   }, 10000);

//   setTimeout(() => {
//     markNotif();
//   }, 30000);
// });

// Deno.cron("Bersih - bersih data", "0 0 1 * *", () => {
//   deleteNotif();
//   sendLogTele("Proses pembersihan database telah dilakukan");
// });

Deno.serve({ port: 80 }, (_req) => new Response("Avada Kenava!"));
