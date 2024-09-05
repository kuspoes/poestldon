const kv = await Deno.openKv(
  "https://api.deno.com/databases/8224906d-742a-4220-9a66-638bf8d37da3/connect",
);

interface notifId {
  id: string;
  dataId: string;
}

async function initKv() {
  try {
    const f = await fetch(`${Deno.env.get("GTS_API")}`, {
      method: "GET",
      headers: {
        "Content-Type": "Application/json",
        Authorization: `Bearer ${Deno.env.get("GTS_TOKEN")}`,
      },
    });

    const data = await f.json();
    const data_id = [];
    for await (const d of data) data_id.push(d.id);

    const kvData = kv.list({ prefix: ["notif_id"] });
    const kvDataId = [];
    for await (const k of kvData) kvDataId.push(k.value);

    for (const v of kvDataId) {
      const x = data_id.includes(v);
      if (x == true) {
        console.log("break");
      }
    }

    // for (const di of data_id) {
    //   const res = await kv.set(["notif_id", di], di);
    //   if (res.ok == false) {
    //     throw new Error(`tidak bisa menulis ke KV!`);
    //   }
    // }
  } catch (e) {
    console.log(e);
  }
}

initKv();
