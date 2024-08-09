// %%

import TurndownService from "turndown";
const td = new TurndownService();

const content =
  '<p><span class="h-card"><a class="u-url mention" href="https://kauaku.us/@poes" rel="nofollow noreferrer noopener" target="_blank"><span>@poes</span></a></span><span> yes, that suck<br><br>Saya juga heran om, soalnya saya juga ngalamin.. Karena lihat tanggal sudah ga mungkin, gas pas masih ada 2 mingguan itu... Disuruh balik.. Akhirnya ya itu online, meski sim nya nyampe lama</span></p>';

const c = td.turndown(content);
console.log(c);

function stripTags(str: string) {
  if (str == null || str == "") return false;
  else str = str.toString();
  return str.replace(/(<([^>]+)>)/gi, "");
}
