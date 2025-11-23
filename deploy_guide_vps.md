# Panduan Deploy ke VPS (194.233.65.168)

Aplikasi Anda sudah siap. Ikuti 3 langkah mudah ini untuk menayangkannya di internet.

### Langkah 1: Persiapan di Laptop Anda

1. Pastikan semua file proyek ini ada dalam satu folder.
2. Buka terminal/cmd di folder proyek tersebut.

### Langkah 2: Upload File ke Server

Kita akan menggunakan perintah `scp` (Secure Copy) untuk mengirim file ke server mentor Anda. 
*(Password akan diminta setelah menekan enter)*.

```bash
# Upload semua file ke folder home server
scp -r . root@194.233.65.168:~/formapp-source
```

### Langkah 3: Eksekusi di Server

1. Login ke server via SSH:
   ```bash
   ssh root@194.233.65.168
   ```

2. Masuk ke folder yang baru diupload dan jalankan script otomatis:
   ```bash
   cd ~/formapp-source
   
   # Beri izin eksekusi pada script
   chmod +x setup_vps.sh
   
   # Jalankan script (Tunggu 2-5 menit)
   ./setup_vps.sh
   ```

### Selesai!

Setelah script selesai, buka browser dan akses:
**http://194.233.65.168**

Aplikasi Anda sekarang sudah live:
- **Frontend**: Dilayani oleh Nginx.
- **Backend**: Berjalan di port 3001 (dipantau oleh PM2).
- **Database**: PostgreSQL sudah aktif dan terisi tabel.
