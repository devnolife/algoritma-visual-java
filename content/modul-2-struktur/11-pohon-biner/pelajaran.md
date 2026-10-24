---
judul: Pohon biner & traversal
urutan: 11
ringkasan: Menyusun simpul yang bercabang dua menjadi pohon, lalu menelusurinya secara rekursif dalam urutan preorder, inorder, dan postorder.
tujuan:
  - Membangun pohon biner dari objek Node yang punya field left dan right
  - Menyebut akar, anak, daun, subpohon, dan tinggi sebuah pohon
  - Menelusuri pohon secara rekursif dalam urutan preorder, inorder, dan postorder
  - Menghitung jumlah simpul dan tinggi pohon dengan pola rekursi yang sama
visual:
  - jenis: pohon
    akar: root
    penunjuk: [node]
  - jenis: konsol
  - jenis: pohonPanggilan
    method: tinggi
  - jenis: memori
pantau: [kiri, kanan]
---

## Dari silsilah ke pohon biner

Silsilah keluarga, bagan organisasi, dan folder di komputermu punya bentuk yang sama: satu titik di puncak yang bercabang ke bawah, dan setiap cabang bisa bercabang lagi. Struktur seperti ini disebut **pohon** (*tree*). Setiap titiknya adalah **simpul** (*node*). Simpul paling atas disebut **akar** (*root*), simpul tepat di bawah sebuah simpul adalah **anak**-nya, dan simpul tanpa anak disebut **daun** (*leaf*).

Pada **pohon biner**, setiap simpul punya paling banyak dua anak: anak **kiri** dan anak **kanan**. Simpulnya mirip simpul linked list, hanya saja penghubungnya ada dua:

```java
class Node {
    int data;
    Node left;    // anak kiri, null bila tidak ada
    Node right;   // anak kanan, null bila tidak ada
}
```

Baris 13–19 membangun pohon di bawah ini dengan menyambung objek satu per satu. Misalnya, `root.left.right = new Node(9);` membuat simpul 9, lalu menyimpan alamatnya di field `right` milik simpul 5.

```text
          8
        /   \
       5     4
      / \     \
     2   9     6
              /
             3
```

- Akarnya 8, dan daunnya 2, 9, serta 3. Simpul 4 hanya punya anak kanan, sedangkan simpul 6 hanya punya anak kiri.
- Setiap anak adalah akar dari pohon yang lebih kecil, yaitu **subpohon** (*subtree*). Subpohon kiri akar berisi 5, 2, dan 9.
- **Tinggi** pohon adalah banyaknya tingkat dari akar sampai daun terjauh. Pohon ini setinggi 4 tingkat (8 → 4 → 6 → 3). Sebagian buku menghitung banyaknya garis (sisi) sehingga tingginya 3; di sini kita menghitung tingkat, sama seperti panggung visual.

> **Coba sendiri:** hapus baris 18 (`root.right.right = new Node(6);`). Baris berikutnya kini mengisi field `left` milik simpul yang tidak pernah dibuat, sehingga program berhenti dengan `NullPointerException: Cannot assign field "left" because "root.right.right" is null`.

## Tiga cara menelusuri

**Menelusuri** (*traversal*) pohon berarti mengunjungi setiap simpul tepat satu kali. Karena setiap subpohon juga sebuah pohon, rekursi adalah cara yang paling alami:

- **Base case:** subpohon kosong (`node == null`), tidak ada yang perlu dikunjungi.
- **Recursive case:** kunjungi simpul ini, telusuri subpohon kiri, lalu telusuri subpohon kanan.

Ketiga urutan penelusuran hanya berbeda pada **kapan** simpul itu sendiri dikunjungi. Di program ini, "mengunjungi" berarti mencetak `data`-nya.

| Urutan | Langkah | Hasil |
|---|---|---|
| **Preorder** | simpul, kiri, kanan | `8 5 2 9 4 6 3` |
| **Inorder** | kiri, simpul, kanan | `2 5 9 8 4 3 6` |
| **Postorder** | kiri, kanan, simpul | `2 9 5 3 6 4 8` |

Setiap urutan punya kegunaan. Preorder mencatat induk sebelum anak-anaknya, jadi cocok untuk menyalin atau menyimpan bentuk pohon. Postorder menyelesaikan anak sebelum induknya, jadi cocok untuk menghitung ukuran folder (isi subfolder dijumlahkan lebih dulu) atau menghapus seluruh pohon. Inorder pada pohon pencarian biner, yang akan kamu pelajari berikutnya, menghasilkan data yang terurut.

> **Coba sendiri:** di method `inorder`, tukar letak baris `inorder(node.left);` dan `System.out.print(" " + node.data);`. Baris `Inorder` kini tercetak sama persis dengan baris `Preorder`, karena simpul dikunjungi sebelum anak-anaknya.

> **Coba sendiri:** hapus baris 35 (`if (node == null) return;`). Preorder masih sempat mencetak `8 5 2`, lalu turun ke anak kiri simpul 2 yang bernilai `null`. Program berhenti dengan `NullPointerException: Cannot read field "data" because "node" is null`. Base case inilah yang menghentikan rekursi di ujung setiap cabang.

## Menghitung dengan rekursi

Pola yang sama dipakai untuk menghitung: tanyakan jawabannya kepada subpohon kiri dan subpohon kanan, lalu gabungkan dengan simpul ini.

- `jumlahSimpul`: subpohon kosong berisi 0 simpul. Selain itu, jawabannya 1 (simpul ini) ditambah jumlah simpul di kiri dan di kanan.
- `tinggi`: subpohon kosong setinggi 0. Selain itu, tingginya 1 ditambah tinggi subpohon yang **lebih tinggi** (baris 62–64).

Kedua tantangan di pelajaran ini memakai pola yang sama untuk menghitung daun dan mencari nilai terbesar.

> **Coba sendiri:** ganti `return 0;` di baris 61 menjadi `return -1;`. Output berubah menjadi `Tinggi: 3`, yaitu tinggi yang dihitung dalam banyaknya sisi. Di pohon panggilan, setiap `tinggi(null)` kini mengembalikan −1.

## Membaca visualnya

- **Pohon.** Simpul yang ditunjuk `node` (parameter milik frame teratas) disorot beserta jalurnya dari akar. Saat `node` bernilai `null`, kepala visual menulis `node = null`: penelusuran sedang berada di cabang kosong di bawah sebuah simpul. Saat pohon dibangun, garis yang baru disambung ikut menyala.
- **Konsol.** Angka hasil penelusuran muncul satu per satu, tepat saat `node` berada di simpul itu.
- **Pohon panggilan.** Hanya pemanggilan `tinggi` yang digambar, jadi panel ini baru terisi di akhir program. Argumennya ditulis sebagai referensi objek (`Node#…`), bukan isi `data`-nya. Bentuknya sama dengan pohon datanya, ditambah satu panggilan `tinggi(null)` untuk setiap cabang kosong. Nilai kembalian (↩) naik dari daun ke akar sampai akar mengembalikan 4.
- **Memori.** Call stack bertambah satu frame setiap kali penelusuran turun satu tingkat. Setiap frame punya `node` sendiri yang menunjuk simpul berbeda.
- **Tanda hijau di slider** muncul setiap kali `kiri` atau `kanan` di method `tinggi` terisi.

## Kompleksitas

Setiap penelusuran mengunjungi setiap simpul tepat satu kali, jadi waktunya **O(n)** untuk n simpul. Banyaknya pemanggilan adalah 2n + 1: n untuk simpul, ditambah n + 1 untuk cabang kosong. Pohon ini punya 7 simpul, jadi setiap penelusuran memanggil method-nya 15 kali.

Memori call stack sebanding dengan tinggi pohon. Pohon yang **seimbang** setinggi kira-kira log₂ n, sedangkan pohon yang **miring** ke satu sisi bisa setinggi n. Linked list sebenarnya adalah pohon paling miring: setiap simpulnya hanya punya satu anak.

## Catatan #sambung
`new Node(5)` membuat objek baru, lalu alamatnya disimpan di field `left` milik akar. Sejak saat itu simpul 5 menjadi **anak kiri** simpul 8.

## Catatan #dasar
Base case: subpohon kosong (`null`) tidak punya simpul untuk dikunjungi, jadi method langsung kembali. Tanpa baris ini, `node.data` di baris berikutnya memicu **NullPointerException**.

## Catatan #tinggi
Tinggi simpul ini adalah 1 (dirinya sendiri) ditambah tinggi subpohon yang **lebih tinggi**. `Math.max(kiri, kanan)` memilih yang lebih besar dari keduanya.
