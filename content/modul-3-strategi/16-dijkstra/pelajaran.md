---
judul: "Dijkstra: jarak terpendek"
urutan: 16
ringkasan: Mencari jarak terpendek dari satu simpul ke semua simpul graf berbobot dengan memilih simpul terdekat secara greedy, lalu merelaksasi sisi-sisinya.
tujuan:
  - Menyimpan graf berbobot sebagai matriks ketetanggaan
  - Menjelaskan langkah greedy Dijkstra, yaitu memilih simpul belum selesai yang jaraknya terkecil
  - Melakukan relaksasi sisi dan menjelaskan mengapa jarak simpul yang sudah terpilih tidak berubah lagi
  - Menganalisis kompleksitas O(V²) versi matriks
visual:
  - jenis: graf
    variabel: graf
    label: jarak
    dikunjungi: selesai
    simpul: [u, v]
    posisi: [[5, 50], [40, 8], [40, 92], [80, 8], [95, 70]]
  - jenis: evaluasi
  - jenis: memori
pantau: [u]
---

## Rute tercepat

Aplikasi peta dan ojek daring selalu mencari rute **tercepat**, bukan sekadar rute dengan belokan paling sedikit. Jaringan jalan bisa dimodelkan sebagai **graf berbobot**: setiap sisi punya **bobot**, misalnya jarak dalam kilometer atau waktu tempuh dalam menit. Di matriks ketetanggaan, `graf[u][v]` kini berisi bobot sisi, dan 0 berarti tidak ada jalan.

Perhatikan graf di editor. Dari simpul 0 ke simpul 1 ada jalan langsung berbobot 6, tetapi memutar lewat simpul 2 hanya 2 + 3 = 5. Jalan langsung belum tentu terpendek, dan BFS yang hanya menghitung banyaknya sisi tidak bisa melihat perbedaan ini. Algoritma **Dijkstra** menghitung jarak terpendek dari satu simpul awal ke **semua** simpul lain, asalkan tidak ada bobot yang negatif.

## Greedy dan relaksasi

Dijkstra menyimpan `jarak[v]`, yaitu jarak terpendek ke `v` yang **sudah diketahui sejauh ini**. Awalnya semua bernilai tak hingga, kecuali simpul awal yang bernilai 0. Setelah itu:

1. **Pilih** simpul `u` yang belum selesai dan `jarak`-nya terkecil (baris 18–23). Inilah langkah **greedy**: ambil yang terbaik saat ini. Tandai `selesai[u] = true`, karena jaraknya sudah final.
2. **Relaksasi** setiap sisi dari `u`: untuk tetangga `v` yang belum selesai, bila jalan lewat `u` lebih pendek, yaitu `jarak[u] + graf[u][v] < jarak[v]`, perbarui `jarak[v]` (baris 25–29).
3. Ulangi sampai semua simpul selesai, yaitu sebanyak `n` putaran.

Mengapa simpul yang terpilih sudah final? Semua simpul lain yang belum selesai jaraknya sama atau lebih besar. Karena bobot tidak pernah negatif, jalan memutar lewat simpul mana pun hanya menambah panjang, jadi tidak mungkin lebih pendek.

Jejak program di editor:

| Putaran | `u` terpilih | `jarak` setelah relaksasi |
|---|---|---|
| 1 | 0 | `[0, 6, 2, ∞, ∞]` |
| 2 | 2 | `[0, 5, 2, 9, 11]` |
| 3 | 1 | `[0, 5, 2, 6, 11]` |
| 4 | 3 | `[0, 5, 2, 6, 8]` |
| 5 | 4 | `[0, 5, 2, 6, 8]` |

Tiga relaksasi memperbaiki jarak yang sudah tercatat: simpul 1 dari 6 menjadi 5, simpul 3 dari 9 menjadi 6, dan simpul 4 dari 11 menjadi 8. Perhatikan juga bahwa simpul terpilih berurutan dari yang terdekat ke yang terjauh: 0, 2, 1, 3, lalu 4.

> **Coba sendiri:** hapus `!selesai[v] &&` dari kondisi di baris 26. Outputnya tetap sama, karena relaksasi ke simpul yang sudah selesai memang tidak pernah berhasil: jaraknya sudah final. Pemeriksaan itu hanya menghemat pekerjaan.

> **Coba sendiri:** hapus baris 15 (`Arrays.fill`). Semua jarak kini berawal dari 0, bukan tak hingga, sehingga tidak ada relaksasi yang berhasil dan outputnya `Jarak dari 0: [0, 0, 0, 0, 0]`.

## Membaca visualnya

- **Graf.** Angka di tengah sisi adalah bobotnya, dan tulisan `jarak=…` di bawah simpul adalah isi array `jarak`. Tanda `∞` berarti jalannya belum ditemukan. Simpul hijau sudah selesai.
- **Simpul oranye** adalah `u`. Saat memilih (baris 19–23), simpul oranye berpindah setiap kali ditemukan calon yang lebih dekat, sampai tersisa yang terdekat. Saat relaksasi, simpul biru adalah tetangga `v` yang sedang diperiksa, dan sisi `u`–`v` ikut menyala.
- **Evaluasi** menampilkan perbandingan beserta angkanya, misalnya `0 + 6 < 2147483647`. Di dalam program, tak hingga memang hanyalah bilangan `int` terbesar, yaitu `Integer.MAX_VALUE`.
- **Tanda hijau di slider** muncul setiap kali `u` berubah: saat putaran baru dimulai (`u = -1`) dan saat calon yang lebih dekat ditemukan.

> **Coba sendiri:** ubah bobot sisi 1–3 dari 1 menjadi 9, yaitu `graf[1][3]` dan `graf[3][1]`. Kini jalan terpendek ke simpul 3 langsung dari simpul 2 (2 + 7 = 9), dan outputnya menjadi `Jarak dari 0: [0, 5, 2, 9, 11]`.

> **Coba sendiri:** ganti `<` menjadi `>` di baris 20, sehingga yang dipilih justru simpul **terjauh**. Hasilnya kacau, bahkan ada yang negatif. Simpul yang jaraknya masih `Integer.MAX_VALUE` ikut dipakai untuk relaksasi, dan `Integer.MAX_VALUE + 6` meluap (**overflow**) menjadi bilangan negatif. Pilihan greedy yang benar adalah kunci Dijkstra.

## Kompleksitas

Ada `n` putaran. Setiap putaran memilih simpul terdekat dengan menyisir `n` simpul, lalu merelaksasi dengan menyisir satu baris matriks sepanjang `n`. Jadi untuk graf dengan V simpul, waktunya **O(V²)**. Untuk graf besar yang sisinya jarang, simpul terdekat biasanya dipilih dengan *priority queue* sehingga waktunya menjadi O((V + E) log V).

Dijkstra hanya benar bila semua bobot tidak negatif. Bila ada bobot negatif, jalan memutar justru bisa memperpendek jarak simpul yang sudah dianggap final, sehingga dibutuhkan algoritma lain seperti Bellman-Ford.

## Catatan #awal
`Integer.MAX_VALUE` dipakai sebagai **tak hingga**, yaitu jarak simpul yang belum pernah dicapai. Di graf, nilainya ditampilkan sebagai `∞`.

## Catatan #pilih
Langkah **greedy**: `u` adalah simpul belum selesai yang jaraknya paling kecil. Jaraknya sudah final, jadi `u` langsung ditandai `selesai`.

## Catatan #relaksasi
**Relaksasi**: jalan ke `v` lewat `u` panjangnya `jarak[u] + graf[u][v]`. Bila lebih pendek daripada `jarak[v]` yang sekarang, catatan jarak `v` diperbarui.