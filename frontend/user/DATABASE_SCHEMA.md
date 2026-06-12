# Desain Struktur Database - Ngolab Bakso (Gamifikasi F&B)

Dokumen ini menjelaskan rancangan basis data untuk aplikasi **Ngolab Bakso**, mencakup fitur keanggotaan, afiliasi, sistem poin, dan gamifikasi.

---

## 1. Daftar Tabel (Entitas)

| No | Nama Tabel | Fungsi Utama |
|:---|:---|:---|
| 1 | `users` | Menyimpan data profil member dan afiliator (identitas & saldo). |
| 2 | `user_missions` | Catatan progres misi yang sedang atau sudah dijalankan oleh user. |
| 3 | `point_history` | Log rincian riwayat transaksi poin (masuk dan keluar). |
| 4 | `rewards` | Data master katalog voucher/hadiah yang dapat ditukar. |
| 5 | `redemptions` | Catatan penukaran poin user menjadi hadiah/voucher. |
| 6 | `transactions` | Catatan pembelian makanan/transaksi riil di outlet. |

---

## 2. Struktur Tabel (Schema)

### A. Tabel: `users`
Menyimpan informasi utama pengguna.
| Nama Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | VARCHAR (PK) | Unique ID user. |
| `name` | VARCHAR | Nama lengkap pengguna. |
| `email` | VARCHAR | Alamat email (unique). |
| `is_affiliate` | BOOLEAN | Status Afiliasi (Read-only dari Membership API). |
| `points_balance` | INTEGER | Saldo XP Poin saat ini. |
| `level` | VARCHAR | Tingkatan member (SILVER, GOLD, PLATINUM). |
| `streak_count` | INTEGER | Jumlah hari check-in berturut-turut. |
| `last_checkin` | TIMESTAMP | Waktu terakhir melakukan check-in harian. |
| `created_at` | TIMESTAMP | Waktu pendaftaran. |

### B. Tabel: `missions`
Daftar misi yang tersedia.
| Nama Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | VARCHAR (PK) | Unique ID misi. |
| `title` | VARCHAR | Judul misi (contoh: "Beli 5 Bakso"). |
| `description` | TEXT | Penjelasan detail misi. |
| `points_reward` | INTEGER | Poin yang didapat setelah selesai. |
| `target_value` | INTEGER | Target progres (contoh: 5). |
| `mission_type` | VARCHAR | Kategori: DAILY, REFERRAL, TRANSACTION. |

### D. Tabel: `user_missions`
Melacak progres misi per individu.
| Nama Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | VARCHAR (PK) | Unique ID progres. |
| `user_id` | VARCHAR (FK) | ID User yang menjalankan misi. |
| `mission_id` | VARCHAR (FK) | ID Misi yang diambil. |
| `current_progress`| INTEGER | Nilai progres saat ini (contoh: 3). |
| `is_completed` | BOOLEAN | Status apakah sudah selesai. |
| `claimed_at` | TIMESTAMP | Tanggal klaim reward poin. |

### E. Tabel: `point_history`
Audit trail untuk setiap perubahan poin.
| Nama Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | VARCHAR (PK) | Unique ID transaksi poin. |
| `user_id` | VARCHAR (FK) | Pemilik poin. |
| `type` | ENUM | EARN (masuk), REDEEM (keluar). |
| `amount` | INTEGER | Jumlah poin. |
| `description` | VARCHAR | Keterangan (contoh: "Reward Misi Daily"). |
| `created_at` | TIMESTAMP | Waktu pencatatan. |

### F. Tabel: `rewards`
Katalog voucher.
| Nama Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | VARCHAR (PK) | Unique ID reward. |
| `title` | VARCHAR | Nama voucher (contoh: "Gratis Es Teh"). |
| `cost_points` | INTEGER | Harga dalam poin. |
| `stock` | INTEGER | Sisa stok voucher. |
| `expiry_days` | INTEGER | Masa berlaku voucher setelah diklaim. |

### G. Tabel: `redemptions`
Catatan voucher yang sudah ditukar user.
| Nama Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | VARCHAR (PK) | Unique ID penukaran. |
| `user_id` | VARCHAR (FK) | Penukar voucher. |
| `reward_id` | VARCHAR (FK) | ID Hadiah yang ditukar. |
| `voucher_code` | VARCHAR | Kode unik untuk digunakan di kasir. |
| `status` | ENUM | UNUSED, USED, EXPIRED. |
| `created_at` | TIMESTAMP | Waktu penukaran. |

### H. Tabel: `transactions`
Data pembelian makanan.
| Nama Kolom | Tipe Data | Keterangan |
|:---|:---|:---|
| `id` | VARCHAR (PK) | Unique ID transaksi belanja. |
| `user_id` | VARCHAR (FK) | Pembeli (Member). |
| `total_amount` | DECIMAL | Total belanja (Rupiah). |
| `points_earned` | INTEGER | Poin yang didapat dari belanja ini. |
| `created_at` | TIMESTAMP | Tanggal belanja. |

---

## 3. Relasi Antar Tabel

1.  **One-to-Many (`users` ke `point_history`)**: Satu user bisa memiliki banyak riwayat poin.
2.  **One-to-Many (`users` ke `user_missions`)**: Satu user bisa mengikuti banyak misi.
3.  **Many-to-Many (`users` ke `rewards` via `redemptions`)**: User bisa menukar banyak reward, dan satu jenis reward bisa ditukar oleh banyak user.
4.  **Many-to-One (`transactions` ke `users`)**: Setiap transaksi belanja dicatat atas nama satu user member.

---

## 4. Keuntungan Struktur Ini
*   **Scalable**: Mudah menambah jenis misi atau reward baru tanpa merusak data lama.
*   **Traceable**: Semua mutasi poin terekam dengan jelas di `point_history`.
*   **Focused**: Sistem gamifikasi murni (XP & Level) untuk meningkatkan retensi pengguna.
