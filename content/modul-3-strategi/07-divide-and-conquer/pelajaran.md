---
judul: Divide and conquer
urutan: 7
ringkasan: Memecah masalah menjadi bagian yang lebih kecil, menyelesaikannya secara rekursif, lalu menggabungkan hasilnya, dengan contoh menghitung pangkat secara cepat.
tujuan:
  - Menyebutkan tiga tahap divide and conquer, yaitu pecah, selesaikan, dan gabung
  - Menelusuri pohon panggilan pangkat cepat yang membelah eksponen menjadi dua
  - Menjelaskan mengapa pangkat cepat cukup O(log n) panggilan, sedangkan pangkat biasa O(n)
  - Mengenali pemborosan saat sub-masalah yang sama dihitung lebih dari sekali
visual:
  - jenis: pohonPanggilan
  - jenis: evaluasi
  - jenis: memori
pantau: [panggilan, setengah]
pertumbuhan:
  variabel: n
  nilai: [8, 16, 32, 64, 128]
  ukur: panggilan
  seri:
    - nama: pangkat cepat
      ganti: { cepat: true }
    - nama: pangkat biasa
      ganti: { cepat: false }
  acuan: [log n, n]
---

## Pecah, selesaikan, gabung

Bayangkan seorang dosen ingin tahu nilai tertinggi dari 64 lembar ujian. Ia membagi tumpukan menjadi dua dan memberikannya kepada dua asisten. Setiap asisten membagi lagi tumpukannya kepada dua mahasiswa, dan seterusnya, sampai setiap orang hanya memegang satu lembar. Jawabannya lalu dikumpulkan kembali ke atas: setiap orang cukup membandingkan dua angka yang diterimanya dan meneruskan yang lebih besar, persis seperti bagan pertandingan sebuah turnamen.

Strategi ini disebut **divide and conquer** (bagi dan taklukkan), dan terdiri atas tiga tahap:

1. **Pecah** (*divide*): bagi masalah menjadi sub-masalah sejenis yang lebih kecil, biasanya dua bagian yang sama besar.
2. **Selesaikan** (*conquer*): selesaikan setiap sub-masalah dengan cara yang sama, yaitu secara rekursif. Sub-masalah yang sudah cukup kecil menjadi **base case** yang jawabannya langsung diketahui.
3. **Gabung** (*combine*): susun jawaban masalah besar dari jawaban sub-masalahnya.

Pola ini akan kamu pakai lagi di merge sort dan quick sort. Pelajaran ini memakai contoh yang lebih sederhana, yaitu menghitung pangkat.

## Pangkat cepat

Cara biasa menghitung 2⁸ adalah mengalikan 2 sebanyak delapan kali, atau secara rekursif a^n = a × a^(n − 1). Itulah method `pangkatBiasa`. Masalahnya hanya berkurang **satu** setiap kali, sehingga dibutuhkan n + 1 panggilan. Ingat, di Java `^` bukan operator pangkat; di sini a^n hanya notasi matematika.

Divide and conquer melihatnya dengan cara lain: 2⁸ = 2⁴ × 2⁴. Nilai 2⁴ tidak perlu dihitung dua kali. Cukup hitung **sekali**, lalu kuadratkan:

1. **Pecah**: untuk menghitung a^n, cukup ketahui a^(n/2).
2. **Selesaikan**: hitung `setengah = pangkatCepat(a, n / 2)` secara rekursif. Base case-nya a^1 = a.
3. **Gabung**: a^n = `setengah * setengah`.

Setiap panggilan membelah eksponen menjadi dua, 8 → 4 → 2 → 1, jadi hanya ada 4 panggilan. Baris 8–9 memilih method yang dipakai lewat variabel `cepat`, sedangkan field `panggilan` menghitung semua pemanggilan.

## Membaca pohon panggilan

Geser slider. Panel atas menggambar **pohon panggilan**: setiap kotak adalah satu pemanggilan method beserta argumennya, dan kotak yang disorot adalah panggilan yang sedang berjalan. Saat turun, eksponennya terus dibelah dua sampai `pangkatCepat(2, 1)`. Saat naik kembali, setiap kotak menampilkan nilai kembaliannya: `↩ 2`, `↩ 4`, `↩ 16`, lalu `↩ 256`. Tanda hijau di slider menandai saat `panggilan` bertambah (tahap turun) dan saat `setengah` terisi (tahap gabung).

> **Coba sendiri:** ganti `boolean cepat = true;` menjadi `false`. Pohonnya berubah menjadi rantai panjang dari `pangkatBiasa(2, 8)` sampai `pangkatBiasa(2, 0)`, dan output menjadi `Panggilan: 9`, dibanding 4 panggilan pada versi cepat.

Versi `pangkatCepat` di editor masih punya kelemahan: hasilnya baru benar bila n adalah pangkat dari 2.

> **Coba sendiri:** kembalikan `cepat` menjadi `true`, lalu ubah `int n = 8;` menjadi `int n = 6;`. Output-nya `2^6 = 16`, padahal seharusnya 64. Pohonnya menunjukkan sebabnya: `pangkatCepat(2, 6)` memanggil `pangkatCepat(2, 3)`, lalu `pangkatCepat(2, 1)`, karena `3 / 2` bernilai 1 dan satu faktor 2 terbuang. Kamu akan memperbaikinya di tantangan.

## Seberapa cepat?

Pangkat biasa butuh n + 1 panggilan. Pangkat cepat membelah n menjadi dua di setiap panggilan, sehingga banyaknya panggilan hanya log₂ n + 1, yaitu berapa kali n bisa dibagi dua sampai menjadi 1. Untuk n = 1.024, pangkat biasa butuh 1.025 panggilan, sedangkan pangkat cepat cukup 11.

Buka tab **Pertumbuhan**. Kedua method dijalankan untuk n = 8 sampai 128, lalu jumlah panggilannya dibandingkan. Seri pangkat biasa naik 2 kali setiap n dua kali lipat (O(n)). Seri pangkat cepat hanya bertambah satu panggilan setiap n dua kali lipat (O(log n)), sehingga garisnya nyaris mendatar di dasar grafik.

Kecepatan ini datang dari satu keputusan penting: sub-masalah a^(n/2) dihitung **sekali**, lalu hasilnya dipakai dua kali.

> **Coba sendiri:** ganti baris 19 dan 20 dengan satu baris `return pangkatCepat(a, n / 2) * pangkatCepat(a, n / 2);`. Pohonnya kini bercabang dua dan berisi 15 panggilan. Sebagian besar kotaknya bergaris putus-putus, artinya **dihitung ulang** dengan argumen yang persis sama. Di tab Pertumbuhan, seri pangkat cepat berubah menjadi O(n). Membelah masalah saja tidak cukup bila potongan yang sama dikerjakan berulang kali.

## Catatan #dasar
**Base case**: eksponen 1 langsung menghasilkan `a`. Karena eksponennya terus dibelah dua (8, 4, 2, 1), base case ini pasti tercapai bila n pangkat dari 2.

## Catatan #pecah
**Pecah** dan **selesaikan**: masalah a^n diperkecil menjadi a^(n/2), lalu diselesaikan secara rekursif. Hasilnya disimpan di `setengah` karena akan dipakai dua kali.

## Catatan #gabung
**Gabung**: a^n = a^(n/2) × a^(n/2). Cukup satu perkalian `setengah * setengah`, tanpa memanggil `pangkatCepat` lagi.
