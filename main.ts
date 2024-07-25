import { pool } from "./db.ts";
const conn = await pool.connect();

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
      inreply = "-";
      content = "-";
    } else {
      inreply = d.status.in_reply_to_id;
      content = d.status.content;
    }

    if (d.type === "follow") {
      conn.queryObject`
          INSERT INTO ptldn
          (post_id, created_at, handler, display_name, type, remark)
          VALUES
          (${d.id}, ${d.created_at}, ${d.account.acct}, ${d.account.display_name}, ${d.type}, ${remark})
          ON CONFLICT (post_id) DO NOTHING
        `;
    } else {
      conn.queryObject`
          INSERT INTO ptldn
          (inreplyto, post_id, created_at, handler, display_name, type, status, remark)
          VALUES
          (${inreply}, ${d.id}, ${d.created_at}, ${d.account.acct}, ${d.account.display_name}, ${d.type}, ${content}, ${remark})
          ON CONFLICT (post_id) DO NOTHING
        `;
    }
  }
}

async function sendNotif() {
  try {
    const query = await conn.queryObject`
    SELECT * FROM ptldn
    WHERE remark = 'USEND'
    ORDER BY created_at ASC
    `;
    const data: NeonData = query.rows;

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
              parse_mode: "markdown",
              text: `*${d.display_name}*
_${d.handler}_
${flag} ${d.type} you!
`,
            }),
          },
        );
      } else {
        await fetch(
          `https://api.telegram.org/bot${Deno.env.get("TELE_BOT")}/sendMessage`,
          {
            method: "POST",
            headers: {
              "Content-Type": "Application/json",
            },
            body: JSON.stringify({
              chat_id: `${Deno.env.get("TELE_CHATID")}`,
              parse_mode: "markdown",
              text: `*${d.display_name}*
_${d.handler}_
${flag}  ${d.type} you!

"${d.status}"

[source](https://kauaku.us/@poes/statuses/${d.inreplyto})
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
  await conn.queryObject`
    UPDATE ptldn
    SET remark = 'SEND'
    `;
}

async function deleteNotif() {
  await conn.queryObject`
    DELETE from ptldn
    `;
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
        parse_mode: "markdown",
        text: `🔥 *Info*
![koceng](https://i.ibb.co.com/jyZFWRp/cat-shredding.gif)
${msg}
${kapan}
        `,
      }),
    },
  );
}

Deno.cron("Sedot Notification dari Gotosocial", "*/4 * * * *", () => {
  requestNotif();
  sendNotif();
  markNotif();
});

Deno.cron("Bersih - bersih data", "0 0 * * 7", () => {
  deleteNotif();
  sendLogTele("Proses pembersihan database telah dilakukan");
});

Deno.serve({ port: 80 }, (_req: string) => new Response("Avada Kenava!"));
