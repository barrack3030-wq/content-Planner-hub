# Panduan Backend Google Apps Script & Google Sheets

Backend Content Planner dirancang menggunakan **Google Apps Script** sebagai REST API controller dan **Google Sheets** sebagai database relasional sederhana dengan isolasi data berbasis `user_id`.

---

## 1. Persiapan Google Spreadsheet

1. Buka [Google Sheets](https://sheets.new) di browser Anda.
2. Beri nama spreadsheet, contoh: `Content Planner Database`.
3. Anda tidak perlu membuat sheet manual karena script memiliki fungsi `setupDatabase()` otomatis yang akan membuat sheets:
   - `USERS`
   - `SESSIONS`
   - `VERIFICATION_TOKENS`
   - `RESET_TOKENS`
   - `CONTENTS`
   - `IDEAS`
   - `CONTENT_RULES`
   - `SETTINGS`

---

## 2. Pemasangan Script

1. Di Google Sheets, klik menu **Extensions > Apps Script** (Ekstensi > Apps Script).
2. Hapus semua kode default di file `Code.gs`.
3. Salin seluruh isi kode dari file `google-apps-script/Code.gs` ke editor Apps Script.
4. Klik tombol **Save** (ikon disket) atau tekan `Ctrl + S`.
5. *(Opsional)* Di dropdown fungsi atas, pilih `setupDatabase` lalu klik **Run** untuk membuat header tabel secara otomatis. Berikan izin saat diminta.

---

## 3. Deployment sebagai Web App

1. Di pojok kanan atas Apps Script, klik tombol **Deploy** > **New deployment**.
2. Klik ikon gerigi (Select type) > pilih **Web app**.
3. Isi konfigurasi:
   - **Description**: `Content Planner API v1`
   - **Execute as**: `Me (email-anda@gmail.com)`
   - **Who has access**: `Anyone` *(PENTING: harus Anyone agar web app frontend dapat mengirim request HTTP)*
4. Klik **Deploy**.
5. Google akan meminta otorisasi (klik *Review permissions*, pilih akun Google Anda, klik *Advanced*, lalu *Go to Content Planner (unsafe)*, dan klik *Allow*).
6. Salin **Web app URL** yang dihasilkan (format: `https://script.google.com/macros/s/.../exec`).

---

## 4. Hubungkan ke Web App

1. Buka web app Content Planner.
2. Di halaman **Settings** atau **Login/Setup**, masukkan Web App URL Anda.
3. Atau simpan di file `.env` sebagai:
   ```env
   VITE_APPS_SCRIPT_URL="https://script.google.com/macros/s/AKfycb.../exec"
   ```
4. Web app sekarang terhubung langsung ke database Google Sheets Anda secara multi-user dengan isolasi data yang aman!

---

## 5. Mode Simulator / Local Fallback

Aplikasi web juga dilengkapi dengan **Apps Script & Sheets Simulator** lokal jika Anda ingin langsung menguji registrasi, verifikasi email, login, reset password, dan isolasi multi-user secara instan sebelum melakukan deploy ke Google Sheets.
