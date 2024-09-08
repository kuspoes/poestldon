# PoesTeleDon

Ini adalah script sederhana untuk menarik data notifikasi dari API Gotosocial. Kemudian menyimpannya ke dalam database Postgresql dan kemudian dikirim ke Telegram Bot.

# Cara pakai
1. Clone repositori ini,
2. Buat file `.env` di root directory repository yang di-clone
3. Push ke Deno Deploy, bisa dengan Deploy CLI atau pakai Github Integration.

## Environment
Daftar environment yang dipakai:
1. **GTS_TOKEN** : Token Auth dari instance gotosocial, bisa didapatkan dengan mengikuti tutorial di [Authentication with API](https://docs.gotosocial.org/en/latest/api/authentication/) di laman dokumentasi Gotosocial,
2. **GTS API**: endpoint URL dari instance Gotosocial kamu, untuk fetch data. URLnya seperti ini: `https://kauaku.us/api/v1/notifications?limit=5`,
3. **TELE_BOT**: Ini adalah token Bot Telegram, ngobrol dengan Bot Father untuk mendapatkannya,
4. **TELE_CHATID**: Chat ID dari Bot Telegram yang sudah dibuat,
5. **DB_URL**: URL end point dari Postgres, ane pakai Neon.Tech, kalo pakai Supabase mungkin sedikit berbeda. Bisa di dapatkan di dashboard Neon.Tech
6. **DENO_KV_ACCESS_TOKEN**: (Optional) Token DenoKv yang sudah di set di Deno Deploy. Ini opsional ga pakai ini juga ga apa - apa. Cek [tambahkan deno kv](https://github.com/kuspoes/poestldon/commit/17ba36ebcfd968fde7d2b28e2ab79c38e5278388).

Tapi ane sudah drop DenoKv karena versi gratisnya punya limit yang sedikit dan mepet. Implementasi sekarang untuk pakai Postgres jauh lebih baik.
