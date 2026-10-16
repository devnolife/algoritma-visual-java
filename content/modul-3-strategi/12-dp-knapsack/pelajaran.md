---
judul: "DP: Knapsack 0/1"
urutan: 12
ringkasan: Memilih barang untuk ransel berkapasitas terbatas agar nilainya maksimum, dengan mengisi tabel dp[i][w] dari keputusan ambil atau tidak ambil.
tujuan:
  - Merumuskan knapsack 0/1 sebagai tabel dp[i][w] beserta kasus dasarnya
  - Menjelaskan keputusan ambil atau tidak ambil pada rumus rekurens
  - Membaca panah pada tabel DP untuk melihat sel mana yang dipakai mengisi sebuah sel
  - Menghitung kompleksitas O(n × W) dan membandingkannya dengan mencoba semua himpunan barang
visual:
  - jenis: array2d
    variabel: dp
    gaya: tabel
    baris: i
    kolom: w
    labelBaris: nama
  - jenis: evaluasi
  - jenis: memori
pantau: [i]
---

## Ransel yang terbatas

Kamu akan mendaki gunung dengan ransel berkapasitas 6 kg. Ada empat barang yang ingin dibawa, masing-masing dengan berat dan nilai kegunaan:

| Barang | Berat (kg) | Nilai |
|---|---|---|
| Senter | 1 | 1 |
| Tenda | 3 | 5 |
| Kompor | 3 | 6 |
| Makanan | 4 | 9 |

Setiap barang hanya bisa dibawa utuh atau ditinggal, tidak bisa dibawa setengah. Inilah **knapsack 0/1** (0 berarti ditinggal, 1 berarti dibawa). Tujuannya adalah total nilai sebesar mungkin tanpa melebihi kapasitas.

Greedy yang mendahulukan nilai per kg tertinggi akan memilih Makanan (2,25 per kg), lalu Senter, dengan total nilai 10. Padahal Tenda + Kompor tepat 6 kg dengan nilai 11. Mencoba semua himpunan barang (brute force) memang pasti benar, tetapi ada 2ⁿ himpunan untuk n barang. **Dynamic programming** menemukan jawaban terbaik tanpa mencoba semuanya.

## Tabel dp[i][w]

Definisikan `dp[i][w]` sebagai **nilai maksimum yang bisa dicapai dengan i barang pertama dan kapasitas w kg**. Tabelnya berukuran (n + 1) × (kapasitas + 1). Baris 0 (belum ada barang) dan kolom 0 (kapasitas 0) bernilai 0; inilah **kasus dasar**-nya.

Untuk setiap sel, barang ke-`i` dengan berat `b` dan nilai `v` menghadapi dua pilihan:

1. **Tidak ambil.** Nilainya sama dengan memakai `i - 1` barang pertama saja, yaitu `dp[i - 1][w]`.
2. **Ambil**, bila muat (`b <= w`). Kita mendapat nilai `v`, lalu sisa kapasitas `w - b` diisi sebaik mungkin dengan barang-barang sebelumnya, yaitu `dp[i - 1][w - b] + v`.

Jadi rumus rekurensnya:

- bila `b > w`: `dp[i][w] = dp[i - 1][w]`;
- bila `b <= w`: `dp[i][w] = max(dp[i - 1][w], dp[i - 1][w - b] + v)`.

Baris 14 dan 16–18 di editor menuliskan rumus ini apa adanya; komentar `// tidak ambil` dan `// ambil` menandai kedua pilihannya. Setelah tabel penuh, jawabannya ada di sel kanan bawah, `dp[n][kapasitas]`.

## Membaca tabelnya

- Setiap baris diberi label nama barangnya, dan baris `∅` berarti belum ada barang. Kolom `[w]` adalah kapasitas 0 sampai 6 kg.
- Penunjuk `i` (baris) dan `w` (kolom) menandai sel yang sedang diisi.
- Setiap kali satu sel diisi, **panah** menunjukkan sel yang dibaca. Satu panah dari atas berarti barangnya tidak muat. Dua panah berarti program membandingkan pilihan tidak ambil (dari atas) dan ambil (dari baris atas yang bergeser `b` kolom ke kiri).
- Tanda hijau di slider menandai setiap kali `i` berganti, yaitu saat barang berikutnya mulai dipertimbangkan.

Contohnya, saat sel `dp[3][6]` (Kompor, 6 kg) diisi, dua panah masuk ke sel itu: dari `dp[2][6]` = 6 (tanpa kompor) dan dari `dp[2][3]` = 5 (bawa kompor, sisa 3 kg diisi tenda). Karena 5 + 6 = 11 lebih besar daripada 6, `dp[3][6]` bernilai 11.

> **Coba sendiri:** ubah `int kapasitas = 6;` menjadi `5`. Tabelnya menyusut satu kolom dan output menjadi `Nilai maksimum: 10`, yaitu Makanan + Senter. Pada kapasitas ini, pilihan greedy kebetulan juga yang terbaik.

> **Coba sendiri:** tambahkan barang kelima, Kamera seberat 2 kg dengan nilai 4, dengan menambahkan `"Kamera"`, `2`, dan `4` di akhir ketiga array. Tabel bertambah satu baris berlabel Kamera, dan jawabannya naik menjadi 13 (Makanan + Kamera).

## Seberapa cepat?

Tabelnya punya (n + 1) × (W + 1) sel, dengan W adalah kapasitas, dan setiap sel diisi dengan beberapa operasi saja. Jadi waktunya **O(n × W)**, dan memorinya juga sebesar tabel itu. Untuk 4 barang dan 6 kg hanya 28 sel yang dihitung, sedikit lebih banyak daripada 2⁴ = 16 himpunan. Tetapi untuk 40 barang dan kapasitas 100 kg, DP cukup mengisi sekitar 4.000 sel, sedangkan brute force harus memeriksa 2⁴⁰, lebih dari satu triliun himpunan.

Perhatikan bahwa W adalah **nilai** kapasitas, bukan banyaknya data. Bila berat ditulis dalam gram (kapasitas 6.000), tabelnya menjadi 1.000 kali lebih lebar walaupun soalnya sama.

## Catatan #tabel

Tabel berukuran `(n + 1) × (kapasitas + 1)`. Baris 0 (tanpa barang) dan kolom 0 (kapasitas 0) adalah **kasus dasar** bernilai 0, dan Java sudah mengisinya otomatis.

## Catatan #tidakMuat

Barang ke-`i` lebih berat daripada kapasitas `w`, jadi tidak mungkin diambil. Nilai terbaiknya sama dengan sel di atasnya, `dp[i - 1][w]`.

## Catatan #pilih

Inti knapsack: bandingkan **tidak ambil** (`dp[i - 1][w]`) dengan **ambil** (`dp[i - 1][w - b] + v`), lalu simpan yang lebih besar. Kedua sel yang dibaca ditunjukkan oleh panah.
