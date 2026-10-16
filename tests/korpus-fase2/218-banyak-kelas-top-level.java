// Beberapa kelas top-level saling bekerja sama: Produk, ItemKeranjang, Keranjang, dan Kasir
public class Main {
    public static void main(String[] args) {
        Produk buku = new Produk("Buku tulis", 6000);
        Produk pena = new Produk("Pena", 3500);
        Produk tas = new Produk("Tas", 125000);
        Keranjang k = new Keranjang(5);
        k.tambah(buku, 4);
        k.tambah(pena, 2);
        k.tambah(tas, 1);
        k.tambah(pena, 3);
        k.cetak();
        Kasir kasir = new Kasir("Lina");
        int kembalian = kasir.hitung(k, 200000);
        System.out.println("Kembalian: " + kembalian);
        pena.harga = 4000;
        System.out.println("Harga pena naik, total keranjang sekarang " + k.total());
        System.out.println("Transaksi kasir " + kasir.nama + ": " + kasir.jumlahTransaksi);
    }
}

class Produk {
    String nama;
    int harga;

    Produk(String nama, int harga) {
        this.nama = nama;
        this.harga = harga;
    }
}

class ItemKeranjang {
    Produk produk;
    int jumlah;

    ItemKeranjang(Produk produk, int jumlah) {
        this.produk = produk;
        this.jumlah = jumlah;
    }

    int subtotal() {
        return produk.harga * jumlah;
    }
}

class Keranjang {
    ItemKeranjang[] item;
    int banyak;

    Keranjang(int kapasitas) {
        item = new ItemKeranjang[kapasitas];
    }

    void tambah(Produk p, int jumlah) {
        for (int i = 0; i < banyak; i++) {
            if (item[i].produk == p) {
                item[i].jumlah += jumlah;
                System.out.println("Tambah jumlah " + p.nama + " menjadi " + item[i].jumlah);
                return;
            }
        }
        item[banyak] = new ItemKeranjang(p, jumlah);
        banyak++;
        System.out.println("Item baru " + p.nama + " x" + jumlah);
    }

    int total() {
        int t = 0;
        for (int i = 0; i < banyak; i++) {
            t += item[i].subtotal();
        }
        return t;
    }

    void cetak() {
        for (int i = 0; i < banyak; i++) {
            ItemKeranjang it = item[i];
            System.out.printf("%-12s %3d x %7d = %8d%n", it.produk.nama, it.jumlah, it.produk.harga, it.subtotal());
        }
        System.out.printf("%-12s %23d%n", "TOTAL", total());
    }
}

class Kasir {
    String nama;
    int jumlahTransaksi;

    Kasir(String nama) {
        this.nama = nama;
    }

    int hitung(Keranjang k, int uang) {
        jumlahTransaksi++;
        int total = k.total();
        System.out.println(nama + " menerima " + uang + " untuk total " + total);
        return uang - total;
    }
}
