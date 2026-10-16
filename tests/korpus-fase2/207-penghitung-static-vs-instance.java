// Field static dibagi semua objek, field instance milik masing-masing objek; nomor otomatis dari penghitung static
public class Main {
    public static void main(String[] args) {
        System.out.println("Awal: Tiket.terjual = " + Tiket.terjual);
        Tiket t1 = new Tiket("Ani");
        Tiket t2 = new Tiket("Budi");
        Tiket t3 = new Tiket("Citra");
        System.out.println(t1.info());
        System.out.println(t2.info());
        System.out.println(t3.info());
        t2.batal();
        System.out.println("Setelah Budi batal: terjual = " + Tiket.terjual + ", berikutnya = " + Tiket.berikutnya);
        Tiket t4 = new Tiket("Dedi");
        System.out.println(t4.info());
        System.out.println("Laporan: " + Tiket.laporan());
        t1.kunjungan++;
        t1.kunjungan++;
        t3.kunjungan++;
        System.out.println("kunjungan t1 = " + t1.kunjungan + ", t3 = " + t3.kunjungan + ", t4 = " + t4.kunjungan);
    }
}

class Tiket {
    static int terjual = 0;
    static int berikutnya = 1;
    final int nomor;
    String nama;
    int kunjungan;

    Tiket(String nama) {
        this.nama = nama;
        this.nomor = berikutnya;
        berikutnya++;
        terjual++;
    }

    void batal() {
        terjual--;
    }

    String info() {
        return "Tiket #" + nomor + " atas nama " + nama + " (terjual " + terjual + ")";
    }

    static String laporan() {
        return terjual + " tiket aktif, nomor terakhir " + (berikutnya - 1);
    }
}
