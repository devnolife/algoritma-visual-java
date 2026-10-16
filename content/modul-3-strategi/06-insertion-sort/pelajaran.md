---
judul: Insertion sort
urutan: 6
ringkasan: Mengurutkan seperti menata kartu di tangan, yaitu menyisipkan setiap elemen ke posisi yang tepat di bagian yang sudah terurut.
tujuan:
  - Menjelaskan ide insertion sort, yaitu mengambil satu elemen lalu menyisipkannya ke bagian yang sudah terurut
  - Menelusuri cara elemen yang lebih besar digeser ke kanan untuk memberi celah
  - Membedakan kasus terbaik O(n) pada data terurut dan kasus terburuk O(n²)
  - Membaca dua seri grafik pertumbuhan, yaitu data acak dan data terurut
visual:
  - jenis: array
    variabel: data
    gaya: batang
    penunjuk: [i, j]
  - jenis: evaluasi
  - jenis: memori
pantau: [kunci]
pertumbuhan:
  variabel: n
  nilai: [8, 16, 32, 64, 128]
  ukur: perbandingan
  seri:
    - nama: data acak
    - nama: data terurut
      ganti: { terurut: true }
  acuan: [n, n^2]
---

## Menata kartu di tangan

Bayangkan kamu bermain kartu. Kartu di tanganmu sudah urut. Setiap kali mengambil kartu baru dari meja, kamu menyisipkannya ke tempat yang tepat: kartu-kartu yang lebih besar digeser sedikit ke kanan untuk memberi celah, lalu kartu baru diselipkan. Inilah **insertion sort**, pengurutan dengan penyisipan.

Seperti selection sort, array terbagi menjadi bagian terurut di kiri dan bagian belum terurut di kanan. Bedanya, bagian kiri insertion sort hanya terurut **terhadap sesamanya**. Elemen yang datang belakangan masih bisa disisipkan di antaranya, jadi posisi di bagian kiri belum tentu posisi akhir.

## Langkah-langkahnya

Elemen pertama dianggap sudah terurut. Untuk setiap `i` dari 1 sampai `n - 1`:

1. Ambil `kunci = data[i]`.
2. Mulai dari `j = i - 1`, bandingkan `data[j]` dengan `kunci`:
   - jika `data[j] <= kunci`, berhenti dengan `break`, karena tempat `kunci` sudah ketemu;
   - jika lebih besar, **geser** `data[j]` satu langkah ke kanan (`data[j + 1] = data[j]`), lalu mundur (`j--`).
3. **Sisipkan** `kunci` ke celah yang tersisa, yaitu `data[j + 1]`.

Data awalnya sama dengan pelajaran selection sort, `[12, 49, 36, 23, 10, 47, 34]`, agar kedua algoritma mudah dibandingkan.

## Membaca visualnya

Panah `i` menunjuk elemen yang sedang diambil, sedangkan panah `j` bergerak mundur ke kiri mencari tempat. Tanda hijau di slider menandai setiap kali `kunci` baru diambil.

Perhatikan saat penggeseran: untuk sementara ada dua batang yang sama tinggi, karena `data[j]` disalin ke `data[j + 1]`. Tidak ada data yang hilang, karena nilai yang tertimpa sudah aman di variabel `kunci` (lihat panel memori). Baru di baris 23 `kunci` ditulis ke celahnya.

Bila `kunci` lebih kecil dari semua elemen di kirinya, misalnya 10 pada putaran `i = 4`, `j` turun sampai −1. Panahnya tampil merah di sel bayangan ✕ di kiri array, karena −1 memang di luar indeks. Itu bukan error: `while (j >= 0)` berhenti sebelum `data[-1]` dibaca, lalu `kunci` masuk ke `data[0]`.

> **Coba sendiri:** hapus baris 23 (`data[j + 1] = kunci;`), lalu geser slider. Elemen tetap digeser, tetapi `kunci` tidak pernah dikembalikan, sehingga batang kembar terus bertambah. Output-nya menjadi `Terurut: [12, 12, 49, 49, 49, 49, 49]`: nilai-nilai yang diambil sebagai `kunci` hilang dari array.

## Kasus terbaik dan terburuk

Banyaknya perbandingan insertion sort sangat bergantung pada keadaan awal data:

- **Kasus terbaik**, data sudah terurut. Setiap putaran langsung `break` setelah 1 perbandingan, jadi totalnya `n - 1` perbandingan: O(n).
- **Kasus terburuk**, data terurut terbalik. Setiap `kunci` harus digeser sampai ujung kiri, jadi totalnya 1 + 2 + … + (n − 1) = n(n − 1)/2 perbandingan: O(n²).
- **Data acak** ada di antara keduanya. Rata-rata setiap `kunci` bergeser kira-kira setengah jalan, jadi tetap O(n²).

> **Coba sendiri:** ganti `boolean terurut = false;` menjadi `true`. Panah `j` hanya muncul sebentar di kiri `i` lalu langsung berhenti, tidak ada batang yang digeser, dan output menjadi `Perbandingan: 6`, yaitu n − 1.

Buka tab **Pertumbuhan**. Setiap kali n dua kali lipat, seri data acak naik kira-kira 4 kali (O(n²)), sedangkan seri data terurut hanya naik 2 kali (O(n)). Bandingkan dengan selection sort yang kedua garisnya berimpit. Karena kasus terbaiknya cepat, insertion sort sering dipakai untuk data yang **hampir terurut**.

> **Coba sendiri:** buat data terurut terbalik dengan mengganti baris 9 menjadi `data[k] = n - k;`. Output menjadi `Perbandingan: 21`, yaitu 7 × 6 / 2. Di tab Pertumbuhan, kedua seri sekarang berimpit di O(n²), karena baris itu tidak lagi memakai variabel `terurut`.

## Catatan #ambil
`kunci` menyimpan elemen yang akan disisipkan. Nilainya harus diamankan dulu, karena `data[i]` akan tertimpa saat elemen di kirinya digeser ke kanan.

## Catatan #banding
Bila `data[j]` **tidak lebih besar** dari `kunci`, tempatnya sudah ketemu, yaitu tepat di kanan `data[j]`. Bila lebih besar, `data[j]` digeser ke kanan dan `j` mundur. `break` inilah yang membuat data terurut cukup O(n).

## Catatan #sisip
`kunci` ditulis ke celah di `data[j + 1]`. Bila `j` sudah −1, `kunci` adalah nilai terkecil sejauh ini dan masuk ke `data[0]`.
