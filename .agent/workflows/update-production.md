---
description: Workflow untuk update aplikasi di production mode
---

# Workflow Update Aplikasi Production

Gunakan workflow ini setiap kali Anda ingin melakukan perubahan atau menambahkan fitur baru pada aplikasi yang sudah berjalan di production mode dengan PM2.

## Langkah-langkah Update

### 1. Development & Testing
- Lakukan perubahan kode sesuai kebutuhan
- Test perubahan di development mode terlebih dahulu
- Pastikan tidak ada error di console browser maupun terminal

### 2. Backup (Opsional tapi Disarankan)
```bash
# Backup database (jika ada perubahan schema)
# Sesuaikan dengan setup database Anda
```

### 3. Update Frontend (jika ada perubahan di frontend)

#### a. Build production frontend
```bash
npm run build
```

#### b. Verifikasi build berhasil
- Pastikan folder `dist/` ter-update dengan file terbaru
- Check timestamp file di folder `dist/`

#### c. Reload Apache
- Buka XAMPP Control Panel
- Stop Apache, kemudian Start kembali
- Atau cukup klik "Reload" jika tersedia

### 4. Update Backend (jika ada perubahan di backend)

#### a. Compile TypeScript (jika menggunakan TypeScript)
```bash
cd server
npm run build
```

#### b. Restart PM2
```bash
# Lihat daftar aplikasi yang berjalan
pm2 list

# Restart aplikasi backend (ganti <app-name> dengan nama aplikasi Anda)
pm2 restart <app-name>

# Atau restart semua aplikasi
pm2 restart all

# Lihat logs untuk memastikan tidak ada error
pm2 logs <app-name> --lines 50
```

### 5. Update Database (jika ada perubahan schema)
```bash
cd server
npm run migrate
# atau
npx drizzle-kit push
```

### 6. Verifikasi Perubahan

#### a. Clear cache browser
- Tekan `Ctrl + Shift + Delete` atau `Ctrl + F5` untuk hard reload

#### b. Test fungsionalitas
- Login ke aplikasi
- Test fitur yang baru ditambahkan/diubah
- Verifikasi tidak ada error di console

#### c. Monitor logs
```bash
# Monitor logs backend
pm2 logs <app-name>

# Monitor logs Apache (jika diperlukan)
# Check di: C:\xampp\apache\logs\error.log
```

### 7. Rollback (jika terjadi masalah)

#### a. Rollback kode
```bash
git checkout <previous-commit>
```

#### b. Rebuild dan restart
```bash
# Frontend
npm run build

# Backend
cd server
npm run build
pm2 restart <app-name>
```

## Tips & Best Practices

1. **Selalu test di development sebelum deploy ke production**
2. **Gunakan version control (Git)** untuk tracking perubahan
3. **Backup database** sebelum melakukan perubahan schema
4. **Monitor logs** setelah deployment untuk mendeteksi error
5. **Gunakan environment variables** untuk konfigurasi yang berbeda antara dev dan production
6. **Dokumentasikan perubahan** yang Anda lakukan

## Troubleshooting

### Perubahan frontend tidak terlihat
- Clear cache browser (Ctrl + F5)
- Pastikan build berhasil dan folder `dist/` ter-update
- Restart Apache di XAMPP

### Perubahan backend tidak terlihat
- Pastikan PM2 sudah restart: `pm2 restart <app-name>`
- Check logs: `pm2 logs <app-name>`
- Pastikan TypeScript sudah di-compile: `npm run build`

### Error setelah update
- Check logs: `pm2 logs <app-name>`
- Check Apache error logs: `C:\xampp\apache\logs\error.log`
- Rollback ke versi sebelumnya jika diperlukan

## PM2 Commands Reference

```bash
# Lihat status aplikasi
pm2 status
pm2 list

# Restart aplikasi
pm2 restart <app-name>
pm2 restart all

# Stop aplikasi
pm2 stop <app-name>

# Start aplikasi
pm2 start <app-name>

# Lihat logs
pm2 logs <app-name>
pm2 logs <app-name> --lines 100

# Monitor resource usage
pm2 monit

# Hapus aplikasi dari PM2
pm2 delete <app-name>

# Save PM2 configuration
pm2 save

# Resurrect saved processes (setelah restart Windows)
pm2 resurrect
```
