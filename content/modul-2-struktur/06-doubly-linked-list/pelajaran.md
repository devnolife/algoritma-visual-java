---
judul: Doubly linked list & LinkedList
urutan: 6
ringkasan: Menyambung simpul ke dua arah dengan prev dan next, sehingga list bisa ditelusuri maju maupun mundur, lalu mengenali struktur yang sama di dalam java.util.LinkedList.
tujuan:
  - Membuat simpul dua arah dengan field prev dan next, serta menjaga head dan tail tetap benar
  - Menyisipkan dan menghapus simpul dengan memperbarui sambungan di kedua arah
  - Menelusuri list maju dari head dan mundur dari tail
  - Memakai java.util.LinkedList (addFirst, addLast, getFirst, removeFirst, removeLast) dan membandingkan kompleksitasnya dengan array
visual:
  - jenis: rantai
    kepala: head
    sebelum: prev
    penunjuk: [baru, n, curr, tail]
  - jenis: koleksi
    variabel: daftar
    isiDalam: true
  - jenis: memori
pantau: [head, tail]
---

## Maju dan mundur

Bayangkan playlist musik: tombol ⏭ memutar lagu berikutnya dan tombol ⏮ kembali ke lagu sebelumnya. Singly linked list dari pelajaran sebelumnya hanya punya `next`, jadi untuk mundur satu lagu kamu terpaksa menelusuri ulang dari `head`. **Doubly linked list** (linked list dua arah) menambahkan satu referensi lagi di setiap simpul:

```java
class Node {
    int data;
    Node prev;   // simpul sebelumnya
    Node next;   // simpul sesudahnya
}
```

Selain **head** (simpul pertama), list ini juga menyimpan **tail** (simpul terakhir). Di program ini keduanya adalah field static `Main` (baris 14–15). `prev` milik head dan `next` milik tail bernilai `null`. Untuk setiap dua simpul yang bersebelahan berlaku aturan yang harus selalu dijaga: bila `a.next` menunjuk `b`, maka `b.prev` menunjuk `a`.

## Menyambung dan memutus di dua arah

**Tambah di belakang** (`tambahBelakang`, baris 17–26). Bila list masih kosong, simpul baru menjadi head sekaligus tail. Bila tidak, ada tiga langkah: `tail.next = baru` menyambung arah maju (baris 22), `baru.prev = tail` menyambung arah mundur (baris 23), lalu `tail = baru` (baris 25). Berkat `tail`, simpul terakhir langsung diketahui tanpa menelusuri list.

**Tambah di depan** (`tambahDepan`, baris 28–37) adalah cerminannya: `baru.next = head`, `head.prev = baru`, lalu `head = baru`.

**Hapus** (`hapus`, baris 39–44) melepas simpul `n` dengan menyambungkan kedua tetangganya satu sama lain: tetangga kiri melompati `n` lewat `n.prev.next = n.next` (baris 41), dan tetangga kanan melompati `n` lewat `n.next.prev = n.prev` (baris 43). Bila `n` tidak punya `prev`, berarti `n` adalah head, jadi yang diperbarui adalah `head`. Hal yang sama berlaku untuk `tail`. Simpul `n` sudah tahu kedua tetangganya, jadi tidak perlu mencari simpul sebelumnya seperti pada singly linked list.

> **Coba sendiri:** hapus baris 34 (`head.prev = baru;`). Baris `Maju` tetap `10 20 40`, tetapi baris `Mundur` hanya `40 20`. Di panggung, simpul 20 tidak punya panah balik ke 10; ruang `prev`-nya berisi `∅`. Sambungan maju dan mundur tidak lagi cocok, sehingga penelusuran mundur berhenti di tengah.

> **Coba sendiri:** ganti baris 51 menjadi `hapus(tail);`. Simpul 40 dilepas tanpa menelusuri list, `tail` mundur ke simpul 30, dan outputnya menjadi `Maju: 10 20 30` dan `Mundur: 30 20 10`.

## Membaca visualnya

- **Rantai.** Setiap simpul punya tiga ruang: titik kiri adalah `prev`, angka di tengah adalah `data`, dan titik kanan adalah `next`. Panah atas mengikuti `next` ke kanan, panah bawah mengikuti `prev` ke kiri, dan `∅` berarti `null`. Kotak `head` menunjuk simpul pertama, sedangkan label `tail` menempel di atas simpul terakhir.
- **Simpul di luar rantai.** Simpul `baru` yang belum tersambung digambar di baris terpisah. Saat `hapus` berjalan, simpul `n` yang sedang dilepas juga pindah ke baris sendiri, dan sambungannya ke rantai utama digambar melengkung.
- **Penelusuran.** Baris 54 menelusuri maju dari `head` dengan `curr = curr.next`, sedangkan baris 58 menelusuri mundur dari `tail` dengan `curr = curr.prev`. Ikuti label `curr` yang bergerak ke kanan lalu ke kiri.
- **Tanda hijau di slider** muncul setiap kali `head` atau `tail` berubah.

> **Coba sendiri:** hapus baris 20 (`head = baru;`). Simpul 20, 30, dan 40 tetap tersambung lewat `tail`, tetapi `head` masih `null`. Akibatnya `tambahDepan(10)` mengira list kosong dan menjadikan simpul 10 sebagai head sekaligus tail, sehingga rantai 20, 30, 40 tidak bisa dicapai lagi. Program berhenti di baris `hapus(head.next.next);` dengan **NullPointerException**: `Cannot read field "next" because "Main.head.next" is null`.

## `java.util.LinkedList`

Java sudah menyediakan doubly linked list siap pakai, yaitu `LinkedList` (baris 63–70). Panel koleksi menampilkannya dalam dua bentuk. Bagian atas adalah tampilan abstraknya, yaitu deret berindeks seperti `[10, 20, 40]`. Bagian **isi dalam** (tombol **Lihat isi dalam** sudah aktif) memperlihatkan struktur aslinya: field `first` dan `last`, yang sama dengan `head` dan `tail` kita, serta simpul `Node` dengan field `item`, `next`, dan `prev`.

- `addFirst(x)` dan `addLast(x)` menyisipkan di depan atau di belakang: O(1).
- `getFirst()` dan `getLast()` melihat elemen depan atau belakang tanpa menghapusnya: O(1).
- `removeFirst()` dan `removeLast()` mengambil sekaligus menghapus elemen depan atau belakang: O(1).
- `get(i)` mengambil elemen di indeks `i`: O(n).

`get(i)` tetap harus berjalan dari simpul ke simpul. `LinkedList` mempercepatnya dengan mulai dari ujung yang lebih dekat: dari `first` bila `i` di paruh depan, dari `last` bila di paruh belakang. Trik ini hanya mungkin karena simpulnya bisa ditelusuri ke dua arah.

## Kompleksitas dan perbandingan

- **Akses indeks ke-i:** `ArrayList` O(1); singly dan doubly linked list O(n).
- **Tambah di depan:** `ArrayList` O(n) karena semua elemen digeser; singly dan doubly O(1).
- **Tambah di belakang:** `ArrayList` O(1) rata-rata (sesekali array di dalamnya harus diperbesar); singly O(1) hanya bila menyimpan `tail`; doubly O(1).
- **Hapus di belakang:** `ArrayList` O(1); singly O(n); doubly O(1).
- **Hapus di tengah, bila posisinya sudah diketahui:** `ArrayList` dan singly O(n); doubly O(1).

Pada singly linked list, menghapus simpul terakhir tetap O(n) walaupun ada `tail`, karena simpul sebelum tail harus dicari dari `head`. Harga doubly linked list adalah satu referensi tambahan di setiap simpul dan dua sambungan yang harus selalu diperbarui bersamaan. Pilih `ArrayList` bila program sering mengakses elemen berdasarkan indeks, dan `LinkedList` (atau `ArrayDeque`, yang akan kamu temui di pelajaran stack dan queue) bila program sering menambah dan menghapus di ujung.

## Catatan #maju
Sambungan **maju**: simpul yang tadinya terakhir kini menunjuk simpul baru lewat `next`.

## Catatan #mundur
Sambungan **mundur**: simpul baru menunjuk balik ke `tail` lama lewat `prev`. Setiap sambungan maju harus punya pasangan mundur.

## Catatan #lepas
Tetangga kiri `n` langsung menunjuk tetangga kanan `n`, sehingga `n` dilewati saat menelusuri maju. Baris 43 melakukan hal yang sama untuk arah **mundur**.
