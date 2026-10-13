# Anti-Slop Follow-up — porsipas-deck / slides/porsipas-itcc

> Tanggal: 2026-10-12 · Mode: after (session override)
> Status: 8/8 temuan audit-001 diperbaiki. Build: PASS (`✓ built in 11.01s`).
> File: `slides/porsipas-itcc/index.tsx` (32 edit, 1 file).

## Per item

| # | Aturan | Status | Bukti |
|---|--------|--------|-------|
| 1 | R-25 faint | FIXED | `ink.faint` #8a97a5 → **#5b6774**. Terukur 5.45:1 (krem), 4.99:1 (bento) vs sebelumnya 2.81 / 2.58. |
| 2 | R-25 aksen teks | FIXED | `design.palette.accent` #cc6b28 → **#a9501b**. Semua teks/label aksen lewat `var(--osd-accent)` kini 5.15:1 (krem), 4.51:1 (latar chip). Tint chip/baris/highlight ikut jadi rgba(169, 80, 27, …) agar konsisten. |
| 3 | R-25 gradient | FIXED | Stop gradient → `#cc6b28 → #b4591b → #8f3f0c`. Stop paling muda 3.48:1 (lolos 3:1 teks besar) vs sebelumnya 2.37:1. |
| 4 | R-02 em dash | FIXED | 15 teks terproyeksi (slide, keterangan, speaker notes, meta title) ganti em dash dengan titik dua, koma, tanda kurung, atau `·`. Grep `—` di index.tsx: **0 match**. |
| 5 | R-01 gradient default | FIXED | Gradient kini dipakai tepat 1 kali: wordmark cover (`WordAcc`). Angka stat slide 2 + 4 dan kata aksen headline jadi solid `var(--osd-accent)`. `Tick` juga solid. Grep `ACCENT_GRAD`: 2 match (definisi + WordAcc). |
| 6 | R-37/R-31 palet vs DESIGN.md | FIXED (opsi b) | Palet deck dipertahankan (krem/navy/oranye deep) dengan alasan tertulis di komentar `design` export: editorial presentation palette, sengaja berbeda dari UI produk pastel. Jika tetap mau sejajar brand teal/hijau, bilang, ganti 1 baris. |
| 7 | R-05 ritme + dials | FIXED | Dials dideklarasikan di komentar design: **ENERGY 2 / RHYTHM 3 / MOTION 1**. Slide 4 jadi asimetris `1.35fr 1fr 1fr 1fr` (stat lead lebih lebar). Slide 13 jadi timeline horizontal: garis penghubung di belakang 5 node lingkaran bernomor. |
| 8 | R-02 komentar | FIXED | 18 komentar kode: ` — ` → ` - `. |

## Delivery Gate

- **R-35 build:** PASS — `npm run build` selesai 11.01s, tanpa error (hanya peringatan chunk size >500 kB, bukan error).
- **R-26 link:** PASS — 4 link Figma di slide 16 punya `href` nyata (inspeksi kode; deck statis, tidak ada kontrol lain).
- **R-25 kontras:** PASS — semua pasangan teks/bg terukur dengan `contrast-check.py` (nilai di atas). Satu pengecualian sengaja: label "Fokus Kompetisi" #e2913f di kartu navy gelap = 5.44:1 (lolos).
- **R-02 em dash:** PASS — 0 match di file slide.
- **R-17/R-18/R-38:** PASS (tidak berubah) — angka bersumber, nama tim + screenshot + link asli.

## Catatan

- `#e2913f` tersisa 1 tempat (label di kartu navy gelap, kontras 5.44:1): sengaja dipertahankan.
- Perubahan palet aksen (#cc6b28 → #a9501b) juga menggelapkan ikon Lock, garis kiri kutipan, dan nomor kartu. Semuanya non-teks, lolos 3:1.
- Preview: `npm run dev` di `porsipas-deck/`.
