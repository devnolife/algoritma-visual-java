// Method mengembalikan this sehingga pemanggilan bisa dirantai (gaya builder) pada objek yang sama
public class Main {
    public static void main(String[] args) {
        Pesanan p = new Pesanan("Meja 4");
        p.tambah("Nasi goreng", 2, 18000).tambah("Es teh", 3, 4000).diskon(10).catat("tanpa sambal");
        p.cetak();
        Pesanan q = new Pesanan("Bungkus").tambah("Mie ayam", 1, 15000);
        Pesanan r = q.tambah("Kerupuk", 2, 2000);
        System.out.println("q == r: " + (q == r));
        q.cetak();
        new Pesanan("Meja 1").catat("pelanggan tetap").diskon(50).tambah("Kopi", 1, 8000).cetak();
    }
}

class Pesanan {
    String meja;
    StringBuilder rincian = new StringBuilder();
    int total;
    int diskonPersen;
    String catatan = "-";

    Pesanan(String meja) {
        this.meja = meja;
    }

    Pesanan tambah(String menu, int jumlah, int harga) {
        int sub = jumlah * harga;
        rincian.append("  ").append(menu).append(" x").append(jumlah).append(" = ").append(sub).append('\n');
        total += sub;
        return this;
    }

    Pesanan diskon(int persen) {
        diskonPersen = persen;
        return this;
    }

    Pesanan catat(String c) {
        catatan = c;
        return this;
    }

    void cetak() {
        System.out.println("Pesanan " + meja + " (catatan: " + catatan + ")");
        System.out.print(rincian);
        int potongan = total * diskonPersen / 100;
        System.out.println("  total " + total + ", diskon " + diskonPersen + "% = " + potongan + ", bayar " + (total - potongan));
    }
}
