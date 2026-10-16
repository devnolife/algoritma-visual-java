// Kelas inner (non-static) dibuat dari method instance dan bisa membaca serta mengubah field objek luarnya
public class Main {
    String namaBank;
    int jumlahNasabah;

    Main(String namaBank) {
        this.namaBank = namaBank;
    }

    class Rekening {
        int nomor;
        String pemilik;
        int saldo;

        Rekening(String pemilik, int saldo) {
            jumlahNasabah++;
            this.nomor = 1000 + jumlahNasabah;
            this.pemilik = pemilik;
            this.saldo = saldo;
        }

        String info() {
            return namaBank + " #" + nomor + " " + pemilik + ": " + saldo;
        }
    }

    Rekening buka(String pemilik, int setoranAwal) {
        Rekening r = new Rekening(pemilik, setoranAwal);
        System.out.println("Dibuka: " + r.info());
        return r;
    }

    void jalankan() {
        Rekening a = buka("Ani", 500);
        Rekening b = buka("Budi", 250);
        a.saldo -= 100;
        b.saldo += 100;
        System.out.println(a.info());
        System.out.println(b.info());
        namaBank = "Bank Sentosa";
        System.out.println("Setelah ganti nama bank: " + a.info());
        System.out.println("Jumlah nasabah " + jumlahNasabah);
    }

    public static void main(String[] args) {
        Main bank = new Main("Bank Maju");
        bank.jalankan();
        Main lain = new Main("Bank Kecil");
        lain.buka("Citra", 75);
        System.out.println("Nasabah Bank Kecil: " + lain.jumlahNasabah + ", nasabah bank pertama: " + bank.jumlahNasabah);
    }
}
