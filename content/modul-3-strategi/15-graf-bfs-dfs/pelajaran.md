---
judul: "Graf: BFS & DFS"
urutan: 15
ringkasan: Menelusuri graf yang disimpan sebagai matriks ketetanggaan, melebar lapis demi lapis dengan antrean (BFS) atau mendalam dengan rekursi (DFS).
tujuan:
  - Menyimpan graf tak berarah sebagai matriks ketetanggaan
  - Membuat antrean dari array int[] dengan indeks depan dan belakang
  - Menelusuri graf dengan BFS dan DFS, lalu membandingkan urutan kunjungannya
  - Menjelaskan peran array dikunjungi agar setiap simpul hanya diproses sekali
visual:
  - jenis: graf
    variabel: graf
    dikunjungi: dikunjungi
    simpul: [u, v]
    posisi: [[5, 50], [40, 12], [40, 88], [95, 5], [95, 50], [95, 95]]
  - jenis: array
    variabel: antrean
    penunjuk: [depan, belakang]
  - jenis: pohonPanggilan
    method: dfs
  - jenis: memori
pantau: [u]
---

## Graf dan matriks ketetanggaan

**Graf** terdiri atas **simpul** (*vertex*) dan **sisi** (*edge*) yang menghubungkan dua simpul. Peta jalan antarkota, pertemanan di media sosial, dan jaringan komputer kampus semuanya berbentuk graf. Graf di editor punya 6 simpul (0 sampai 5) dan 6 sisi.

Cara paling sederhana menyimpan graf adalah **matriks ketetanggaan** (baris 2–9): `graf[u][v]` bernilai 1 bila ada sisi antara `u` dan `v`, dan 0 bila tidak ada. Contohnya, `graf[1]` berisi `{1, 0, 0, 1, 1, 0}`, artinya simpul 1 bertetangga dengan simpul 0, 3, dan 4. Karena sisinya tidak berarah, matriksnya **simetris**: `graf[1][3]` dan `graf[3][1]` sama-sama 1.

**Menelusuri** graf berarti mengunjungi semua simpul yang bisa dicapai dari sebuah simpul awal. Ada dua strategi dasar, yaitu melebar (BFS) dan mendalam (DFS). Keduanya memakai array `dikunjungi` agar setiap simpul hanya diproses sekali, walaupun simpul itu bisa dicapai lewat beberapa jalan.

## BFS: melebar dengan antrean

**BFS** (*breadth-first search*) bekerja seperti kabar yang menyebar: mula-mula ke teman dekat, lalu ke teman dari teman, dan seterusnya, **lapis demi lapis**. Urutan ini dijaga oleh **antrean** (*queue*): simpul yang masuk lebih dulu juga keluar lebih dulu (FIFO, *first in, first out*).

1. Masukkan simpul awal ke antrean dan tandai sudah dikunjungi. Di program ini simpul awalnya 0, dikirim lewat `bfs(0)`.
2. Selama antrean belum kosong, ambil simpul `u` dari **depan** antrean.
3. Periksa setiap simpul `v`. Bila `graf[u][v] == 1` dan `v` belum dikunjungi, tandai `v`, lalu masukkan ke **belakang** antrean.

Java punya class antrean siap pakai, tetapi di sini kita membuatnya sendiri dari array `int[]` dengan dua indeks agar cara kerjanya terlihat:

- `antrean[belakang++] = v` menyimpan `v` di indeks `belakang`, lalu `belakang` maju satu (baris 34).
- `antrean[depan++]` mengambil elemen di indeks `depan`, lalu `depan` maju satu (baris 29).
- Isi antrean saat ini adalah `antrean[depan]` sampai `antrean[belakang - 1]`, jadi antrean kosong bila `depan == belakang`. Elemen di kiri `depan` sudah selesai diproses.

Setiap simpul masuk antrean paling banyak sekali, sehingga array sepanjang jumlah simpul sudah cukup. Saat simpul terakhir masuk, `belakang` bernilai 6 dan panggung menandainya merah karena berada di luar indeks 0…5. Ini wajar: `belakang` selalu menunjuk tempat kosong berikutnya, dan `antrean[6]` tidak pernah dibaca.

Hasilnya `BFS: 0 1 2 3 4 5`: mula-mula simpul 0, lalu tetangganya 1 dan 2 yang berjarak 1 sisi, lalu 3, 4, dan 5 yang berjarak 2 sisi.

> **Coba sendiri:** hapus baris 33 (`dikunjungi[v] = true;`). Tanpa tanda itu, simpul yang sama dimasukkan ke antrean berkali-kali sampai antreannya penuh. Setelah mencetak `BFS: 0 1 2 3`, program berhenti dengan **ArrayIndexOutOfBoundsException** di baris `antrean[belakang++] = v;`.

## DFS: mendalam dengan rekursi

**DFS** (*depth-first search*) bekerja seperti menjelajah labirin: ikuti satu lorong sejauh mungkin, lalu mundur hanya saat menemui jalan buntu. Method `dfs(u)` menandai `u`, mencetaknya, lalu begitu menemukan tetangga yang belum dikunjungi, langsung memanggil `dfs` untuk tetangga itu (baris 45). Tetangga berikutnya baru diperiksa setelah panggilan itu kembali.

Urutannya `DFS: 0 1 3 4 5 2`. Dari 1, DFS masuk ke 3 yang ternyata buntu, mundur ke 1, lalu masuk ke 4, terus ke 5, dan terakhir 2. Simpul 2 bertetangga langsung dengan simpul 0, tetapi justru dikunjungi paling akhir. Call stack di panel memori berperan sebagai **tumpukan** (*stack*): panggilan yang terakhir dimulai adalah yang pertama selesai.

Sebelum DFS dimulai, baris 16 membuat array `dikunjungi` yang baru, karena semua simpul sudah ditandai oleh BFS.

> **Coba sendiri:** hapus baris 16. Semua simpul masih bertanda dikunjungi dari BFS, sehingga DFS berhenti setelah simpul awal dan outputnya menjadi `DFS: 0`.

## Membaca visualnya

- **Graf.** Simpul hijau sudah dikunjungi. Simpul oranye adalah `u`, yaitu simpul yang sedang diproses, dan simpul biru adalah `v`, yaitu calon tetangga yang sedang diperiksa. Sisi yang sel matriksnya sedang dibaca ikut menyala. Simpul disusun per lapis BFS: 0 di kiri, lalu 1 dan 2, lalu 3, 4, dan 5.
- **Antrean.** Array `antrean` hanya ada selama method `bfs` berjalan. Penunjuk `depan` dan `belakang` bergerak di bawahnya. Bila layarmu pendek, gulir panggung ke bawah untuk melihatnya.
- **Pohon panggilan.** Setiap kotak adalah satu panggilan `dfs`. Garis-garisnya membentuk **pohon DFS**, yaitu sisi-sisi yang dipakai untuk mencapai setiap simpul pertama kali.
- **Tanda hijau di slider** muncul setiap kali BFS mengambil simpul baru dari antrean, yaitu saat variabel `u` dibuat.

> **Coba sendiri:** tambahkan sisi 3–5 dengan mengubah `graf[3][5]` dan `graf[5][3]` menjadi 1. Urutan BFS tidak berubah, tetapi DFS kini bergerak dari 3 langsung ke 5 sehingga outputnya `DFS: 0 1 3 5 2 4`.

## Kompleksitas

Setiap simpul diproses sekali, dan setiap kali diproses, satu baris matriks sepanjang V diperiksa. Jadi BFS maupun DFS dengan matriks ketetanggaan membutuhkan waktu **O(V²)** untuk graf dengan V simpul, dan matriksnya sendiri memakai memori O(V²). Bila setiap simpul hanya menyimpan daftar tetangganya (**daftar ketetanggaan**), waktunya turun menjadi O(V + E) untuk E sisi. Struktur ini akan kamu temui setelah mengenal koleksi seperti `ArrayList`.

## Catatan #ambil
`antrean[depan++]` membaca elemen di indeks `depan`, **lalu** menaikkan `depan`. Simpul yang diambil adalah simpul yang paling lama menunggu di antrean.

## Catatan #tandai
Simpul ditandai **saat dimasukkan** ke antrean, bukan saat diambil, sehingga tidak ada simpul yang masuk antrean dua kali.

## Catatan #dalam
DFS langsung **masuk lebih dalam** ke tetangga ini. Tetangga lain baru diperiksa setelah panggilan ini kembali, persis seperti mundur di labirin.
