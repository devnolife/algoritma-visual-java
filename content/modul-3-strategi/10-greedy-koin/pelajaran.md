---
judul: "Greedy: uang kembalian"
urutan: 10
ringkasan: Mengambil pilihan yang tampak terbaik pada setiap langkah, seperti kasir yang memberi kembalian dengan keping sesedikit mungkin, lalu mengenali kapan cara ini gagal.
tujuan:
  - Menjelaskan ciri algoritma greedy, yaitu memilih yang terbaik saat ini tanpa meninjau ulang
  - Menerapkan greedy untuk menukar uang kembalian dengan pecahan rupiah
  - Menunjukkan contoh pecahan yang membuat greedy gagal atau tidak optimal
  - Menghitung biaya greedy dan mempercepatnya dengan pembagian bulat
visual:
  - jenis: array
    variabel: pecahan
    penunjuk: [i]
  - jenis: array
    variabel: jumlah
    penunjuk: [i]
  - jenis: evaluasi
  - jenis: memori
pantau: [sisa]
---

## Kembalian dengan keping sesedikit mungkin

Kasir minimarket harus memberi kembalian Rp4.900 dengan keping (koin atau lembar uang) sesedikit mungkin. Tanpa berpikir panjang, ia mengambil pecahan **terbesar** yang tidak melebihi sisa kembalian: Rp2.000, lalu Rp2.000 lagi, lalu Rp500, Rp200, dan Rp200. Lima keping, dan sisanya Rp0.

Cara berpikir ini disebut **algoritma greedy** (serakah). Pada setiap langkah, greedy mengambil pilihan yang **tampak terbaik saat ini** (optimal lokal) dan tidak pernah meninjau ulang pilihan itu, dengan harapan hasil akhirnya juga yang terbaik (optimal global). Greedy biasanya sederhana dan cepat, tetapi tidak selalu benar.

## Langkah-langkahnya

1. Siapkan pecahan yang tersedia, terurut dari yang **terbesar** (baris 3).
2. Untuk setiap pecahan `pecahan[i]`, selama pecahan itu masih muat (`sisa >= pecahan[i]`, baris 7), ambil satu keping: kurangi `sisa` dan tambah `jumlah[i]`.
3. Bila pecahan itu sudah tidak muat, pindah ke pecahan berikutnya yang lebih kecil.
4. Setelah semua pecahan diperiksa, `sisa` seharusnya 0 (baris 15).

Geser slider dan perhatikan penunjuk `i` yang bergerak bersamaan di array `pecahan` dan `jumlah`. Panel evaluasi menampilkan pengecekan `sisa >= pecahan[i]`, misalnya `900 >= 1000` bernilai `false`, sehingga pecahan 1000 dilewati tanpa diambil. Tanda hijau di slider menandai setiap kali `sisa` berubah.

> **Coba sendiri:** balik urutan array menjadi `{100, 200, 500, 1000, 2000}`. Greedy kini mengambil keping terkecil lebih dulu, sehingga outputnya `100 x 49`: perulangan `while` berputar 49 kali dan hasilnya jauh dari minimum. Pilihan greedy hanya masuk akal bila pecahan diperiksa dari yang terbesar.

## Kapan greedy gagal

Greedy tidak pernah mundur. Begitu satu keping diambil, keputusan itu tidak dibatalkan, walaupun ternyata membuat langkah-langkah berikutnya menjadi buruk. Akibatnya greedy bisa gagal dengan dua cara: tidak menemukan jawaban padahal jawaban itu ada, atau menemukan jawaban yang bukan terbaik.

> **Coba sendiri:** anggap laci kasir kehabisan koin Rp100. Hapus `100` dari array `pecahan`, lalu ubah kembalian menjadi `int sisa = 600;`. Greedy mengambil Rp500 dan berhenti dengan `Sisa: 100`, padahal 3 × Rp200 = Rp600 bisa dibayar pas.

> **Coba sendiri:** bayangkan negeri khayalan dengan pecahan `{400, 300, 100}` dan kembalian `600`. Greedy memberi `400 x 1` dan `100 x 2` (tiga keping), padahal `300 x 2` hanya dua keping.

Pecahan rupiah mengikuti pola 1–2–5 (100, 200, 500, 1.000, 2.000, 5.000, dan seterusnya). Untuk pola seperti ini, greedy terbukti selalu memberi jumlah keping minimum, asalkan setiap pecahan tersedia cukup banyak. Untuk sistem pecahan sembarang atau persediaan yang terbatas, kita perlu menimbang kombinasi lain, misalnya dengan brute force atau **dynamic programming** yang dibahas di pelajaran berikutnya.

## Seberapa cepat?

Setiap kali kondisi `while` dicek, terjadi satu dari dua hal: satu keping diambil, atau greedy berpindah ke pecahan berikutnya. Jadi banyaknya pengecekan adalah k + m, dengan k banyaknya jenis pecahan dan m banyaknya keping yang diberikan. Untuk Rp4.900 itu 5 + 5 = 10 pengecekan. Bandingkan dengan brute force yang mencoba semua kombinasi banyak keping untuk setiap pecahan: jumlah kombinasinya meledak begitu jenis pecahan dan nilai kembalian bertambah.

Greedy bahkan bisa lebih cepat lagi. Banyaknya keping suatu pecahan yang diambil greedy bisa langsung dihitung dengan pembagian bulat, sehingga perulangan cukup berputar k kali, berapa pun besar kembaliannya. Itulah tantangan kedua di pelajaran ini.

## Catatan #urut

Greedy untuk uang kembalian hanya masuk akal bila pecahan diperiksa dari yang **terbesar**. Karena itu array ini sengaja ditulis terurut menurun.

## Catatan #rakus

Inilah **pilihan greedy**: selama pecahan ini masih muat, ambil satu keping lagi. Keputusan ini tidak pernah ditinjau ulang.

## Catatan #sisa

Bila `sisa` bukan 0, greedy gagal membayar pas dengan pecahan yang tersedia, padahal bisa jadi ada kombinasi lain yang pas.
