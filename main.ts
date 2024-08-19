import { pool } from "./db.ts";
import { NeonData } from "./NeonData.ts";
import TurndownService from "turndown";

const conn = await pool.connect();

async function requestNotif() {
  const f = await fetch(`${Deno.env.get("GTS_API")}`, {
    method: "GET",
    headers: {
      "Content-Type": "Application/json",
      Authorization: `Bearer ${Deno.env.get("GTS_TOKEN")}`,
    },
  });

  const data = await f.json();

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
  await conn.queryObject<NeonData>`
    UPDATE poestololdon
    SET remark = 'SEND'
    `;
}

async function deleteNotif() {
  try {
    await conn.queryObject<NeonData>`
      DELETE from poestololdon
      WHERE post_id NOT IN(
        (SELECT post_id FROM poestololdon ORDER BY created_at DESC LIMIT 5)
      )`;
  } catch (err) {
    console.log(err);
  }
}

async function sendLogTele(msg: string) {
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
}

Deno.cron("Sedon-simpan-kirim", "*/3 * * * *", () => {
  requestNotif();
  console.log("fetch data from gotosocial at ", Date());
  sendNotif();
  console.log("send data to telegram", Date());
  markNotif();
  console.log("mark data as send");
});

Deno.cron("Bersih - bersih data", "0 0 1 * *", () => {
  deleteNotif();
  sendLogTele("Proses pembersihan database telah dilakukan");
});

/*
async function poestololdonTd() {
  const t = await conn.queryObject<NeonData>`
    SELECT * FROM poestololdon
    ORDER BY created_at DESC
    LIMIT 1
    `;
  const d = t.rows;
  for (const x of d) {
    console.log("JSON Stringify :", JSON.stringify(x.status));
    console.log("Turn Down :", td.turndown(JSON.stringify(x.status)));
  }
}
*/

Deno.serve({ port: 80 }, (_req) => new Response("Avada Kenava!"));
