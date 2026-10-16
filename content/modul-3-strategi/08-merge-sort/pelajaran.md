---
judul: Merge sort
urutan: 8
ringkasan: Mengurutkan dengan divide and conquer, yaitu membelah array menjadi dua, mengurutkan setiap bagian secara rekursif, lalu menggabungkan dua bagian yang sudah terurut.
tujuan:
  - Menjelaskan tiga tahap merge sort, yaitu belah dua, urutkan setiap bagian secara rekursif, lalu gabung
  - Menelusuri penggabungan dua bagian terurut memakai penunjuk i dan j serta array bantu
  - Membaca pohon panggilan mergeSort dan rentang yang sedang dikerjakan setiap panggilan
  - Menjelaskan mengapa merge sort selalu O(n log n), baik pada data acak maupun data terurut
visual:
  - jenis: array
    variabel: data
    gaya: batang
    penunjuk: [i, j]
    rentang: [kiri, kanan]
  - jenis: array
    variabel: bantu
  - jenis: pohonPanggilan
    method: mergeSort
  - jenis: memori
pantau: [perbandingan]
pertumbuhan:
  variabel: n
  nilai: [16, 32, 64, 128, 256]
  ukur: perbandingan
  seri:
    - nama: data acak
    - nama: data terurut
      ganti: { terurut: true }
  acuan: [n, n^2]
---

## Membelah tumpukan kartu

Bayangkan kamu harus mengurutkan setumpuk kartu ujian bersama seorang teman. Tumpukannya dibelah dua, lalu masing-masing mengurutkan setengahnya, dan boleh membelahnya lagi untuk orang lain. Setelah dua tumpukan itu terurut, menggabungkannya mudah: bandingkan kartu teratas kedua tumpukan, ambil yang lebih kecil, lalu ulangi sampai habis.

Inilah **merge sort**, penerapan langsung divide and conquer dari pelajaran sebelumnya:

1. **Pecah**: belah rentang `kiri..kanan` di `tengah = (kiri + kanan) / 2`.
2. **Selesaikan**: urutkan `kiri..tengah` lalu `tengah + 1..kanan` secara rekursif. Rentang berisi satu elemen pasti sudah terurut, dan inilah base case-nya.
3. **Gabung** (*merge*): satukan dua bagian yang sudah terurut menjadi satu rentang terurut.

## Menggabungkan dua bagian terurut

Method `gabung` adalah inti merge sort. Saat dipanggil, bagian kiri `data[kiri..tengah]` dan bagian kanan `data[tengah + 1..kanan]` masing-masing sudah terurut.

1. Siapkan **array bantu** `bantu` sepanjang rentang itu.
2. Penunjuk `i` mulai di awal bagian kiri dan `j` di awal bagian kanan. Bandingkan `data[i]` dengan `data[j]`, salin yang lebih kecil ke `bantu`, lalu majukan penunjuk yang diambil.
3. Bila salah satu bagian habis, salin sisa bagian lainnya apa adanya. Sisa itu sudah terurut dan tidak lebih kecil dari isi `bantu`.
4. Salin `bantu` kembali ke `data[kiri..kanan]`.

Setiap perbandingan menempatkan satu elemen, jadi menggabungkan m elemen butuh paling banyak m − 1 perbandingan.

## Membaca visualnya

- Batang `data` di luar rentang `kiri..kanan` milik panggilan yang sedang berjalan dipudarkan, dan header-nya menulis rentang itu. Rentangnya menyempit saat rekursi masuk dan melebar lagi saat keluar.
- **Pohon panggilan** menunjukkan semua panggilan `mergeSort` sejauh ini; gulir panggung ke bawah bila belum terlihat. Untuk 7 elemen ada 13 panggilan: rentang 0..6 dibelah menjadi 0..3 dan 4..6, dan seterusnya sampai potongan satu elemen. Pohonnya lebar, tetapi panggilan yang aktif otomatis digulir agar terlihat.
- Selama `gabung` berjalan, panah `i` dan `j` menunjuk elemen terdepan kedua bagian, dan `bantu` terisi dari kiri ke kanan. Batang `data` baru berubah saat isi `bantu` disalin kembali. Bila `j` sudah melewati ujung array, panahnya tampil di sel bayangan ✕: artinya bagian kanan sudah habis.

> **Coba sendiri:** hapus baris 23 (`gabung(data, kiri, tengah, kanan);`), lalu geser slider. Pohon panggilannya tetap sama persis, tetapi batang tidak pernah berpindah. Output mencetak urutan semula dan `Perbandingan: 0`. Membelah saja tidak mengurutkan apa pun; seluruh pekerjaan mengurutkan terjadi di tahap gabung.

## Selalu O(n log n)

Perhatikan pohon panggilannya per tingkat. Di setiap tingkat, seluruh n elemen ikut digabung tepat sekali, jadi kerja satu tingkat sekitar n. Karena rentangnya dibelah dua di setiap tingkat, banyaknya tingkat hanya sekitar log₂ n. Totalnya sekitar n × log₂ n, yaitu **O(n log n)**. Untuk n = 1.024, merge sort butuh kurang dari 10.240 perbandingan (n × log₂ n), sedangkan selection sort butuh 523.776.

Berbeda dengan insertion sort, keadaan awal data hampir tidak berpengaruh. Pada data terurut, setiap penggabungan selesai lebih cepat karena bagian kiri habis lebih dulu, tetapi semua tingkat pohon tetap dikerjakan.

> **Coba sendiri:** ganti `boolean terurut = false;` menjadi `true`. Output menjadi `Perbandingan: 11`, hanya sedikit lebih kecil dari 14 pada data acak. Pohon panggilannya sama persis, karena cara membelah tidak bergantung pada isi data.

Buka tab **Pertumbuhan**. Setiap kali n dua kali lipat, kedua seri naik sedikit lebih dari 2 kali. Itulah ciri O(n log n): lebih curam dari O(n), tetapi jauh lebih landai dari O(n²). Seri data terurut lebih rendah, sekitar 60% seri data acak, tetapi bentuk kurvanya sama. Klik **Perbesar & tabel** untuk melihat kurva data acak diapit dua garis putus-putus, yaitu kurva acuan O(n) di atasnya dan O(n²) di bawahnya.

Harga yang dibayar merge sort adalah memori. Array `bantu` membutuhkan ruang tambahan sampai n elemen, sedangkan selection sort dan insertion sort mengurutkan **in-place**, langsung di array aslinya.

## Catatan #dasar
**Base case**: rentang yang berisi satu elemen, atau kosong, pasti sudah terurut, jadi langsung `return` tanpa dibelah lagi.

## Catatan #pecah
Bagian kiri diurutkan **sampai tuntas** lebih dulu, lalu bagian kanan, baru keduanya digabung. Perhatikan rentang `kiri..kanan` di header array mengikuti panggilan yang sedang berjalan.

## Catatan #pilih
Bandingkan elemen terdepan kedua bagian, lalu salin yang **lebih kecil** ke `bantu`. Operator `<=` mendahulukan elemen kiri bila nilainya sama, sehingga nilai kembar tetap dalam urutan semula. Sifat ini disebut **stabil**.
