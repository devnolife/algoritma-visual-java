---
judul: Percabangan switch
urutan: 7
ringkasan: Memilih satu dari banyak cabang berdasarkan satu nilai, lengkap dengan break, default, dan bentuk panah.
tujuan:
  - Menulis switch dengan case, break, dan default
  - Menjelaskan fall-through yang terjadi bila break tidak ditulis
  - Memakai switch pada int, char, dan String
  - Menulis bentuk panah case -> yang tidak membutuhkan break
visual:
  - jenis: evaluasi
  - jenis: memori
pantau: [harga]
---

## Memilih berdasarkan satu nilai

Jika pilihan bergantung pada **satu nilai** yang dibandingkan dengan beberapa nilai tetap, `switch` lebih rapi daripada rantai `if (pilihan == 1) … else if (pilihan == 2) …`.

```java
switch (pilihan) {
    case 1:
        // dijalankan jika pilihan == 1
        break;
    case 2:
        // dijalankan jika pilihan == 2
        break;
    default:
        // dijalankan jika tidak ada case yang cocok
}
```

- Nilai di dalam `switch (...)` dihitung **sekali**, lalu eksekusi **melompat** ke `case` yang nilainya sama.
- `break` mengakhiri switch; eksekusi berlanjut ke baris setelah kurung kurawal penutupnya.
- `default` dijalankan jika tidak ada case yang cocok. Biasanya letaknya paling akhir, sehingga tidak perlu `break`.

Saat slider berada di baris `switch`, panel evaluasi menampilkan `pilihan → 2 → case 2`. Berbeda dengan rantai if, case 1 tidak dicek satu per satu: eksekusi langsung mendarat di isi case 2, dan isi case lain tampak pudar di editor.

> **Coba sendiri:** ubah `pilihan` menjadi 3, lalu 7. Dengan 7 tidak ada case yang cocok, jadi `default` yang dijalankan dan `harga` tetap 0.

## Fall-through: jika break lupa ditulis

Label `case` hanyalah **titik masuk**, bukan pembatas. Setelah masuk ke sebuah case, Java terus menjalankan pernyataan di bawahnya, menembus label case berikutnya, sampai bertemu `break` atau akhir switch. Peristiwa ini disebut **fall-through**.

> **Coba sendiri:** kembalikan `pilihan` menjadi 2, hapus `break;` di case 2, lalu geser slider. Eksekusi "jatuh" ke case 3: "Es teh" ikut tercetak, dan `harga` berubah dua kali (perhatikan tanda hijau di slider) hingga akhirnya 5000.

Lupa menulis `break` tidak menimbulkan error. Program tetap berjalan, tetapi hasilnya salah, sehingga kesalahan ini sulit ditemukan.

Fall-through kadang dipakai dengan sengaja untuk menggabungkan beberapa case yang isinya sama:

```java
switch (bulan) {
    case 4:
    case 6:
    case 9:
    case 11:
        jumlahHari = 30;
        break;
    // ... case lainnya
}
```

## Switch pada char dan String

Selain `int`, switch juga bisa dipakai pada `char` dan `String` (serta `byte` dan `short`):

```java
switch (golongan) {   // golongan bertipe char
    case 'A':
        System.out.println("Istimewa");
        break;
    // ...
}
```

Untuk String, Java mencocokkan **isi** teksnya, dan huruf besar/kecil dibedakan: `"sabtu"` tidak cocok dengan `"Sabtu"`.

Ada beberapa batasan:

- Switch **tidak** bisa dipakai pada `double`, `float`, `long`, atau `boolean`.
- Nilai case harus berupa konstanta. Kondisi rentang seperti `case nilai > 70:` tidak diizinkan; untuk itu gunakan `if`.
- Dua case dengan nilai sama ditolak dengan error `duplicate case label`.

## Bentuk panah case ->

Sejak Java 14, case bisa ditulis dengan tanda panah. Bentuk ini **tidak pernah fall-through**, jadi tidak perlu `break`. Satu case juga boleh memuat beberapa nilai yang dipisah koma, seperti `case "Sabtu", "Minggu"` pada switch kedua di editor. Jika isinya lebih dari satu pernyataan, bungkus dengan `{ }`:

```java
switch (pilihan) {
    case 1 -> System.out.println("Nasi goreng");
    case 2, 3 -> {
        System.out.println("Mie ayam atau es teh");
        System.out.println("Silakan tunggu");
    }
    default -> System.out.println("Menu tidak ada");
}
```

> **Coba sendiri:** ubah `hari` menjadi `"Senin"`, lalu `"sabtu"` (huruf kecil semua). Case mana yang dipilih, dan mengapa?

## Catatan #lompat
Nilai `pilihan` dihitung sekali, lalu eksekusi langsung melompat ke case yang cocok. Tidak ada pemeriksaan satu per satu seperti pada rantai if.

## Catatan #putus
`break` mengakhiri switch. Tanpa baris ini, eksekusi akan terus turun ke isi case 3 (fall-through).

## Catatan #panah
Bentuk panah `->` tidak pernah fall-through, jadi tidak perlu `break`. Perbandingan String di switch membedakan huruf besar dan kecil.
