# Panduan Deployment ARG App ke Server Baru

## Prasyarat di Server Baru

1. **Node.js** v18+ (disarankan v20 LTS)
   - Download: https://nodejs.org/
   
2. **PostgreSQL** v14+
   - Download: https://www.postgresql.org/download/

3. **Git** (opsional, untuk clone dari repository)

---

## Langkah 1: Copy Folder Aplikasi

### Opsi A: Menggunakan Git (Disarankan)
```bash
git clone <url-repository-anda> finance-arg
cd finance-arg
```

### Opsi B: Copy Manual
1. Copy seluruh folder `finance-arg` ke server baru
2. Pastikan folder berikut TIDAK dicopy (karena akan di-install ulang):
   - `node_modules/`
   - `server/node_modules/`

---

## Langkah 2: Setup Database PostgreSQL

1. **Buat database baru:**
```sql
CREATE DATABASE finance_arg;
CREATE USER finance_user WITH PASSWORD 'password_anda';
GRANT ALL PRIVILEGES ON DATABASE finance_arg TO finance_user;
```

2. **Export data dari server lama (opsional - jika ada data):**
```bash
pg_dump -U postgres -h localhost finance_arg > backup.sql
```

3. **Import data ke server baru:**
```bash
psql -U postgres -h localhost finance_arg < backup.sql
```

---

## Langkah 3: Konfigurasi Environment

### Backend (.env di folder server)
Buat file `server/.env`:
```env
# Database
DATABASE_URL=postgresql://finance_user:password_anda@localhost:5432/finance_arg

# Auth
BETTER_AUTH_SECRET=ganti_dengan_secret_random_32_karakter
BETTER_AUTH_URL=http://IP_SERVER_BARU:3001

# Server
PORT=3001
NODE_ENV=production

# Frontend URL (untuk CORS)
FRONTEND_URL=http://IP_SERVER_BARU:5173
```

### Frontend (.env.production di root folder)
Edit file `.env.production`:
```env
VITE_API_URL=http://IP_SERVER_BARU:3001/api/v1
```

> ⚠️ **PENTING**: Ganti `IP_SERVER_BARU` dengan IP address server baru (contoh: `192.168.1.100`)

---

## Langkah 4: Update Konfigurasi Auth

Edit file `server/src/config/auth.ts`, tambahkan IP server baru ke `trustedOrigins`:
```typescript
trustedOrigins: [
    'http://localhost:5173',
    'http://localhost:3001',
    'http://IP_SERVER_BARU:5173',  // Tambahkan ini
    'http://IP_SERVER_BARU:3001',  // Tambahkan ini
],
```

---

## Langkah 5: Install Dependencies & Build

```bash
# Di folder root (frontend)
npm install
npm run build

# Di folder server (backend)
cd server
npm install
npm run build
cd ..
```

---

## Langkah 6: Jalankan Database Migrations

```bash
cd server
npm run db:migrate
cd ..
```

---

## Langkah 7: Setup PM2 (Process Manager)

```bash
# Install PM2 globally
npm install -g pm2

# Install PM2 Windows Startup (jika Windows)
npm install -g pm2-windows-startup

# Update ecosystem.config.cjs dengan path yang benar
# Edit file ecosystem.config.cjs, ganti path sesuai lokasi di server baru

# Start aplikasi
pm2 start ecosystem.config.cjs

# Simpan konfigurasi
pm2 save

# Setup auto-start saat boot (Windows)
pm2-startup install

# Setup auto-start saat boot (Linux/Mac)
pm2 startup
```

---

## Langkah 8: Konfigurasi Firewall

### Windows:
```powershell
netsh advfirewall firewall add rule name="ARG App Frontend (5173)" dir=in action=allow protocol=TCP localport=5173
netsh advfirewall firewall add rule name="ARG App Backend (3001)" dir=in action=allow protocol=TCP localport=3001
```

### Linux (UFW):
```bash
sudo ufw allow 5173/tcp
sudo ufw allow 3001/tcp
```

---

## Langkah 9: Verifikasi

1. **Cek status PM2:**
```bash
pm2 status
```

2. **Cek logs jika ada error:**
```bash
pm2 logs
```

3. **Akses aplikasi:**
   - Dari server: http://localhost:5173
   - Dari jaringan: http://IP_SERVER_BARU:5173

---

## Checklist Migrasi

- [ ] Node.js terinstall
- [ ] PostgreSQL terinstall & database dibuat
- [ ] Folder aplikasi sudah di-copy
- [ ] File `.env` di server sudah dikonfigurasi
- [ ] File `.env.production` sudah diupdate dengan IP baru
- [ ] `auth.ts` sudah diupdate dengan trustedOrigins baru
- [ ] `npm install` di root dan server folder
- [ ] `npm run build` di root dan server folder
- [ ] Database migration sudah dijalankan
- [ ] PM2 sudah terinstall dan running
- [ ] Firewall sudah dikonfigurasi
- [ ] Aplikasi bisa diakses dari browser

---

## Troubleshooting

### Error: Failed to fetch saat login
- Pastikan IP server sudah ditambahkan ke `trustedOrigins` di `auth.ts`
- Pastikan `.env.production` mengarah ke IP yang benar
- Rebuild frontend: `npm run build`
- Restart PM2: `pm2 restart all`

### Error: Database connection failed
- Cek apakah PostgreSQL sudah running
- Cek kredensial di `server/.env`
- Pastikan user PostgreSQL punya akses ke database

### Error: Port sudah digunakan
```bash
# Cari proses yang menggunakan port
netstat -ano | findstr :5173
netstat -ano | findstr :3001

# Kill proses (Windows)
taskkill /PID <PID> /F
```

---

## Perintah PM2 Berguna

| Perintah | Fungsi |
|----------|--------|
| `pm2 status` | Lihat status services |
| `pm2 logs` | Lihat logs real-time |
| `pm2 logs --lines 100` | Lihat 100 baris log terakhir |
| `pm2 restart all` | Restart semua service |
| `pm2 stop all` | Stop semua service |
| `pm2 delete all` | Hapus semua service |
| `pm2 monit` | Monitor resource usage |
