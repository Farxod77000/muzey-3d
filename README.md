# MUZEYCHA 3D — ishchi MVP

Qorong‘i 3D muzey xonasi, 3-shaxsdan ko‘rinadigan avatar, WASD boshqaruvi, devordagi portretlar va video/rasm yuklash.

## O‘rnatish

Kompyuterda Node.js 20.19+ yoki 22+ o‘rnatilgan bo‘lsin.

```bash
npm install
npm run dev
```

Terminalda ko‘rsatilgan havolani oching (odatda `http://localhost:5173`).

## Boshqarish

- W / A / S / D yoki strelkalar: yurish.
- Sichqonchani bosib gorizontal tortish: kamerani aylantirish.
- Devordagi portretni bosish: rasm/video oynasi.
- Telefon: ekrandagi tugmalar va kamera aylantirish tugmalari.
- «Muzeyni tahrirlash»: nomni o‘zgartirish va fayl yuklash.

## Ma’lumotlar

Rasm/video fayllar kompyuterdagi shu brauzerning **IndexedDB** bazasiga yoziladi. Muzey nomi `localStorage`da saqlanadi. Fayllar boshqa odamda ochilmaydi. Xotirani tozalash fayllarni ham o‘chiradi.

MVP 8 ta ramkaga ega; JPEG/PNG/WebP va MP4/WebM, bitta fayl 70 MBgacha. Brauzerning umumiy saqlash cheklovi undan kichik bo‘lishi mumkin.

Bu versiyada **server, autentifikatsiya, umumiy linklar va cloud storage yo‘q**. Ko‘pchilik foydalanuvchilarga ulashish uchun keyingi bosqichda Supabase Storage + DB + login va serverga deploy qo‘shish zarur.

## Ishlab chiqarish uchun yig‘ish

```bash
npm run build
npm run preview
```

`dist/` papkasi statik hostingga joylashtirilishi mumkin (ammo lokal fayllar boshqa qurilmaga sinxronlanmaydi).
