---
judul: Binary search tree
urutan: 12
ringkasan: Menyimpan data di pohon biner yang selalu menaruh kunci kecil di kiri dan kunci besar di kanan, sehingga pencarian cukup menuruni satu jalur dari akar.
tujuan:
  - Menjelaskan aturan binary search tree (BST) dan mengapa penelusuran inorder-nya selalu terurut
  - Menyisipkan kunci secara rekursif dan mencari kunci secara iteratif
  - Menemukan kunci terkecil dan terbesar dengan menuruni satu sisi pohon
  - Membandingkan BST yang seimbang dengan BST miring akibat data yang sudah terurut
visual:
  - jenis: pohon
    akar: root
    penunjuk: [node, curr]
  - jenis: evaluasi
  - jenis: memori
pantau: [kunci]
pertumbuhan:
  variabel: n
  nilai: [8, 16, 32, 64, 128]
  ukur: perbandingan
  seri:
    - nama: data acak
      ganti: { terurut: false }
    - nama: data terurut
      ganti: { terurut: true }
---

## Tebak angka dan kamus

Saat bermain tebak angka 1–100, pertanyaan "lebih besar atau lebih kecil?" membuang separuh kemungkinan sekaligus. Saat mencari kata di kamus, kamu juga tidak membaca dari halaman pertama: kamu membuka di tengah, lalu bergeser ke kiri atau ke kanan.

**Binary search tree** (BST, pohon pencarian biner) menyimpan data dengan cara yang sama. Aturannya berlaku di **setiap** simpul:

- semua kunci di subpohon kiri **lebih kecil** daripada kunci simpul itu;
- semua kunci di subpohon kanan **lebih besar atau sama dengan** kunci simpul itu.

Pohon di pelajaran sebelumnya bukan BST, karena 9 berada di subpohon kiri akar 8. Berkat aturan ini, mencari sebuah kunci cukup menuruni **satu jalur** dari akar: setiap perbandingan membuang seluruh subpohon di sisi yang lain.

## Menyisipkan: turun sampai menemukan tempat kosong

Perulangan di baris 18–21 menyisipkan tujuh kunci. Selama `terurut` bernilai `false`, rumus di baris 19 menghasilkan kunci acak 64, 15, 94, 45, 124, 75, 26 tanpa ada yang kembar. Method `sisip` bekerja secara rekursif:

1. Bila `node` bernilai `null`, tempat kosong sudah ditemukan. Buat simpul baru di situ (baris 33). Simpul baru selalu menjadi **daun**.
2. Bila belum, bandingkan `x` dengan `node.data` (baris 36), lalu sisipkan ke subpohon kiri atau kanan.
3. Simpan hasilnya kembali ke `node.left` atau `node.right` (baris 37 dan 39), lalu kembalikan `node`.

Langkah ketiga tampak berlebihan, tetapi penting. Hanya panggilan terdalam yang benar-benar mengubah sesuatu, yaitu mengganti `null` dengan simpul baru; panggilan lain menulis ulang alamat yang sama. Karena itu pula `main` menulis `root = sisip(root, kunci);`: pada sisipan pertama, `root` berubah dari `null` menjadi simpul 64.

```text
         64
       /    \
     15      94
       \    /  \
       45  75  124
      /
     26
```

Ikuti kunci 26: 26 < 64 ke kiri, 26 ≥ 15 ke kanan, 26 < 45 ke kiri, lalu tempatnya kosong. Itu tiga perbandingan; total untuk ketujuh kunci adalah 11, sesuai baris pertama output.

> **Coba sendiri:** di baris 36, ganti `x < node.data` menjadi `x > node.data`. Pohonnya tercermin: kunci besar kini di kiri, sehingga inorder tercetak menurun dan output menulis `Terkecil: 124`. Method `cari` masih memakai aturan lama, jadi `Ada 45?` menjadi `false` walaupun 45 ada di pohon. Sisip dan cari harus memakai aturan yang sama.

## Mencari, terkecil, dan inorder yang terurut

Method `cari` (baris 59–67) menuruni pohon dengan penunjuk `curr` tanpa rekursi. Ia berhenti dengan `true` bila kuncinya ketemu, atau `false` bila `curr` jatuh ke `null`. Mencari 80 hanya memeriksa 64, 94, dan 75. Versi rekursifnya sama pendeknya:

```java
static boolean cari(Node node, int x) {
    if (node == null) return false;
    if (x == node.data) return true;
    if (x < node.data) return cari(node.left, x);
    return cari(node.right, x);
}
```

Kunci **terkecil** selalu berada di simpul paling kiri: turuni `left` sampai tidak bisa lagi (baris 51–57). Kunci terbesar ada di simpul paling kanan, dan menuliskannya adalah tantangan pertama.

Penelusuran inorder mencetak subpohon kiri (semuanya lebih kecil), lalu simpulnya, lalu subpohon kanan (semuanya lebih besar). Karena aturan itu berlaku di setiap simpul, **inorder sebuah BST selalu terurut naik**: `15 26 45 64 75 94 124`. Jadi BST juga bisa dipakai untuk mengurutkan: sisipkan semua data, lalu telusuri secara inorder.

## Membaca visualnya

- **Pohon.** Selama `sisip` berjalan, simpul yang ditunjuk `node` disorot beserta jalurnya dari akar; jalur itu adalah deret perbandingan untuk kunci yang sedang disisipkan. Saat `node` bernilai `null`, kepala visual menulis `node = null`: tempat kosong sudah ditemukan. Simpul baru muncul begitu alamatnya disimpan ke `left` atau `right` milik induknya. Saat `cari` dan `terkecil` berjalan, yang disorot adalah `curr`.
- **Evaluasi.** Setiap perbandingan ditulis ulang, misalnya `x < node.data` → `26 < 64` → `true`.
- **Tanda hijau di slider** menandai setiap `kunci` baru yang akan disisipkan.

## Data terurut membuat pohon miring

Bila `terurut` bernilai `true`, kuncinya 10, 20, …, 70. Setiap kunci lebih besar daripada semua kunci sebelumnya, jadi selalu masuk ke kanan. Pohonnya menjadi rantai miring setinggi 7, mirip linked list.

> **Coba sendiri:** ubah baris 16 menjadi `boolean terurut = true;`, lalu geser slider. Perbandingan naik dari 11 menjadi 21, dan mencari 80 kini memeriksa ketujuh simpul. Saat kunci terakhir disisipkan, call stack berisi tujuh frame `sisip`.

Tab **Pertumbuhan** menjalankan program untuk n = 8 sampai 128 dengan dua seri. Pada data acak, setiap sisipan menuruni pohon yang tingginya sekitar log₂ n, jadi total perbandingannya tumbuh seperti **O(n log n)**: 713 perbandingan untuk n = 128. Pada data terurut, sisipan ke-k menuruni k − 1 simpul, jadi totalnya n(n − 1)/2 atau **O(n²)**: 8.128 perbandingan untuk n = 128.

| Operasi | BST seimbang | BST miring | Array terurut |
|---|---|---|---|
| Cari | O(log n) | O(n) | O(log n), pencarian biner |
| Sisip | O(log n) | O(n) | O(n), elemen harus digeser |
| Terkecil atau terbesar | O(log n) | O(n) | O(1) |

BST secepat pencarian biner untuk mencari, tetapi jauh lebih cepat untuk menyisipkan, asalkan pohonnya tetap seimbang. Pustaka Java menjamin hal itu: `TreeMap` dan `TreeSet` memakai **pohon merah-hitam**, yaitu BST yang menyeimbangkan dirinya sendiri setiap kali disisipi, sehingga tingginya selalu O(log n).

## Catatan #baru
Tempat kosong sudah ditemukan. Simpul baru selalu dipasang sebagai **daun**, lalu alamatnya dikembalikan ke pemanggil.

## Catatan #arah
Aturan BST: kunci yang lebih kecil ke **kiri**, sisanya (termasuk yang sama) ke **kanan**. Satu perbandingan ini membuang seluruh subpohon di sisi lain.

## Catatan #sambung
Hasil `sisip` pada subpohon disimpan kembali ke field anak. Hanya panggilan terdalam yang mengganti `null` dengan simpul baru; panggilan lain menulis ulang **alamat yang sama**.
