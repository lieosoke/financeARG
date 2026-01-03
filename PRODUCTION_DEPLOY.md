# ARG Finance App - Production Deployment Guide

## ✅ Deployment Status: COMPLETE

Aplikasi sudah di-build dan dikonfigurasi untuk auto-start.

---

## Lokasi File

| Komponen | Lokasi |
|----------|--------|
| Frontend (Production) | `d:\xampp\htdocs\arg-app` |
| Backend Source | `d:\xampp\htdocs\finance-arg\server` |
| Startup Script | `d:\xampp\htdocs\finance-arg\START_ARG_APP.bat` |
| Apache Config | `d:\xampp\apache\conf\extra\httpd-arg-app.conf` |

---

## Konfigurasi Apache (WAJIB - Satu Kali)

### 1. Edit `d:\xampp\apache\conf\httpd.conf`

**Uncomment (hapus #) baris-baris ini:**
```apache
LoadModule proxy_http_module modules/mod_proxy_http.so
LoadModule rewrite_module modules/mod_rewrite.so  
LoadModule headers_module modules/mod_headers.so
```

**Tambahkan di akhir file:**
```apache
# ARG Finance App
Include conf/extra/httpd-arg-app.conf
```

### 2. Restart Apache
- XAMPP Control Panel → Stop Apache → Start Apache

---

## Auto-Start saat Boot

Shortcut sudah dibuat di:
```
%APPDATA%\Microsoft\Windows\Start Menu\Programs\Startup\ARG Finance App.lnk
```

Saat laptop restart, aplikasi akan otomatis:
1. ✅ Start Apache web server
2. ✅ Start Backend API server (port 3001)

---

## Manual Start/Stop

### Start Manual
```batch
d:\xampp\htdocs\finance-arg\START_ARG_APP.bat
```

### Stop Backend
```powershell
taskkill /F /IM node.exe
```

### Stop Apache
Gunakan XAMPP Control Panel

---

## Akses Aplikasi

| URL | Keterangan |
|-----|------------|
| http://192.168.1.31 | Akses dari jaringan lokal |
| http://localhost | Akses dari komputer ini |
| http://192.168.1.31:3001/api/v1 | Backend API langsung |

## Kredensial Login
- **Email:** `owner@argtravel.id`
- **Password:** `admin123`

---

## Troubleshooting

### Backend tidak jalan
1. Cek apakah port 3001 digunakan: `netstat -ano | findstr :3001`
2. Jalankan manual: `cd d:\xampp\htdocs\finance-arg\server && npm run dev`

### Login gagal
1. Pastikan backend berjalan
2. Cek `server\.env` → `BETTER_AUTH_URL=http://192.168.1.31:3001`

### Halaman 404 / blank
1. Pastikan `mod_rewrite` enabled
2. Restart Apache setelah konfigurasi
