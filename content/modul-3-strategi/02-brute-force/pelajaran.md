---
judul: Brute force
urutan: 2
ringkasan: Menyelesaikan masalah dengan mencoba semua kemungkinan satu per satu, lalu menghitung harga yang harus dibayar untuk kesederhanaan itu.
tujuan:
  - Menjelaskan strategi brute force sebagai pencarian menyeluruh atas semua kandidat solusi
  - Menyusun perulangan bersarang yang memeriksa setiap pasangan tepat satu kali
  - Menghitung banyaknya kandidat yang diperiksa dan menyimpulkan kompleksitasnya O(n²)
  - Menerapkan brute force pada teks dengan pencocokan string naif
visual:
  - jenis: array
    variabel: harga
    penunjuk: [i, j]
  - jenis: evaluasi
  - jenis: memori
pantau: [ditemukan]
pertumbuhan:
  variabel: n
  nilai: [7, 14, 28, 56]
  ukur: perbandingan
  acuan: [n]
---

## Coba semua kemungkinan

Kamu lupa kode gembok koper yang terdiri atas tiga angka. Cara yang pasti berhasil: coba 000, 001, 002, … sampai 999. Paling banyak 1000 kali percobaan, dan gemboknya pasti terbuka.

Itulah **brute force** atau **pencarian menyeluruh** (*exhaustive search*): daftarkan semua kandidat solusi, lalu periksa satu per satu. Strategi ini hanya butuh dua hal:

1. Cara membuat daftar **semua** kandidat, tanpa ada yang terlewat atau terulang.
2. Cara memeriksa apakah satu kandidat memenuhi syarat.

Kelebihannya, brute force sederhana dan hampir selalu benar. Kelemahannya, banyaknya kandidat sering tumbuh jauh lebih cepat daripada ukuran datanya.

## Pasangan berjumlah target

Saldo dompet digitalmu Rp59 ribu, dan kamu ingin menghabiskannya tepat untuk **dua** barang berbeda. Array `harga` berisi harga n = 7 barang (dalam ribuan rupiah). Pasangan mana saja yang jumlahnya tepat 59?

Kandidatnya adalah semua pasangan barang. Algoritmanya:

1. Pilih barang pertama `i`, dari indeks 0 sampai n − 2.
2. Untuk setiap `i`, pilih barang kedua `j`, dari `i + 1` sampai n − 1.
3. Periksa apakah `harga[i] + harga[j] == target`.
4. Bila ya, catat pasangan itu: cetak harganya dan naikkan `ditemukan`.

Indeks `j` dimulai dari `i + 1` karena sebuah barang tidak boleh dipasangkan dengan dirinya sendiri, dan pasangan (2, 3) sama saja dengan pasangan (3, 2).

Geser slider dan perhatikan panah **i** dan **j** di bawah array: `j` menyapu ke kanan, lalu `i` maju satu dan `j` mulai lagi tepat di sebelahnya. Panel evaluasi menulis ulang pemeriksaannya, misalnya `harga[i] + harga[j] == target` → `12 + 47 == 59` → `59 == 59` → `true`. Tanda hijau di slider menandai saat `ditemukan` berubah: sekali ketika variabel itu dibuat, lalu tiga kali ketika pasangan ditemukan.

> **Coba sendiri:** di baris 12, ubah `int j = i + 1` menjadi `int j = 0`. Setiap pasangan kini tercetak dua kali (`12 + 47` dan `47 + 12`), ringkasannya menjadi `Pasangan: 6`, dan perbandingannya naik dari 21 menjadi 42. Kandidatnya terulang.

## Berapa banyak yang dicoba?

Saat i = 0 ada 6 pasangan yang diperiksa, saat i = 1 ada 5, dan seterusnya:

```text
6 + 5 + 4 + 3 + 2 + 1 = 21 = n(n − 1)/2   untuk n = 7
```

Menurut aturan Big-O dari pelajaran sebelumnya, n(n − 1)/2 = ½n² − ½n termasuk **O(n²)**. Brute force memeriksa semua kandidat apa pun isinya, sehingga kasus terbaik dan terburuknya sama.

> **Coba sendiri:** ubah baris 8 menjadi `int target = 60;`. Tidak ada satu pun pasangan yang cocok (`Pasangan: 0`), tetapi output tetap `Perbandingan: 21`. Semua kandidat tetap harus diperiksa sebelum kita yakin jawabannya "tidak ada".

Buka tab **Pertumbuhan**: untuk n = 7, 14, 28, dan 56, banyaknya perbandingan adalah 21, 91, 378, dan 1540. Setiap kali n naik 2×, perbandingannya naik sekitar 4×, sehingga garisnya berimpit dengan kurva O(n²), jauh di atas kurva O(n). Untuk 1000 barang ada hampir 500 ribu pasangan; untuk sejuta barang, sekitar 500 miliar. Bila yang dicari kombinasi **tiga** barang, kandidatnya menjadi n(n − 1)(n − 2)/6, yaitu O(n³).

## Brute force pada teks: pencocokan string naif

Masalah lain yang sering diselesaikan dengan brute force adalah mencari sebuah **pola** di dalam **teks**, misalnya `"abra"` di dalam `"abrakadabra"`. Kandidatnya adalah setiap posisi awal di teks:

1. Coba setiap posisi awal `i`, dari 0 sampai panjang teks dikurangi panjang pola.
2. Bandingkan pola dengan teks mulai dari posisi `i`, karakter demi karakter, dan berhenti pada ketidakcocokan pertama.
3. Bila semua karakter pola cocok, pola ditemukan di posisi `i`.

```java
static int cariPola(String teks, String pola) {
    int n = teks.length();
    int m = pola.length();
    for (int i = 0; i <= n - m; i++) {
        int k = 0;
        while (k < m && teks.charAt(i + k) == pola.charAt(k)) {
            k++;
        }
        if (k == m) return i;   // semua karakter cocok
    }
    return -1;
}
```

Untuk teks sepanjang n dan pola sepanjang m, ada n − m + 1 posisi awal dan setiap posisi butuh paling banyak m perbandingan karakter, sehingga kasus terburuknya **O(n·m)**. Kasus terburuk itu muncul pada teks seperti `"aaaaaaaab"` dengan pola `"aaab"`: di hampir setiap posisi, tiga karakter pertama cocok dulu sebelum akhirnya gagal.

Brute force menjadi patokan awal. Strategi pada pelajaran berikutnya (pencarian biner, divide and conquer, greedy, dynamic programming) pada dasarnya adalah cara cerdas untuk **tidak** memeriksa semua kandidat.

## Catatan #luar
`i` cukup berhenti di `n - 2`, karena barang terakhir tidak punya pasangan lagi di sebelah kanannya.

## Catatan #dalam
`j` dimulai dari `i + 1`, sehingga barang tidak dipasangkan dengan dirinya sendiri dan setiap pasangan hanya diperiksa **sekali**.

## Catatan #cek
Inilah pemeriksaan satu kandidat. Brute force menjalankan baris ini untuk **setiap** pasangan, baik yang cocok maupun tidak.
