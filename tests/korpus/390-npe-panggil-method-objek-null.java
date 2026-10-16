// NPE saat memanggil method pada objek null: pesan menyebut method beserta kelasnya (kelas bersarang tercetak Main$Akun, kelas top-level tanpa prefiks)
public class Main {
    static class Akun {
        String pemilik;
        int saldo;

        Akun(String pemilik, int saldo) {
            this.pemilik = pemilik;
            this.saldo = saldo;
        }

        int setor(int x) {
            saldo += x;
            return saldo;
        }
    }

    static Akun[] daftar = {new Akun("Ani", 100), null, new Akun("Cici", 50)};

    public static void main(String[] args) {
        for (int i = 0; i < daftar.length; i++) {
            try {
                System.out.println("setor ke akun " + i + ": saldo " + daftar[i].setor(10));
            } catch (NullPointerException e) {
                System.out.println("akun " + i + ": " + e.getMessage());
            }
        }
        Akun ditemukan = null;
        for (Akun a : daftar) {
            if (a != null && a.pemilik.equals("Budi")) {
                ditemukan = a;
            }
        }
        try {
            ditemukan.setor(5);
        } catch (NullPointerException e) {
            System.out.println("ditemukan: " + e.getMessage());
        }
        Dompet dompet = null;
        System.out.println("isi dompet: " + dompet);
        dompet.bayar(20000, "kopi");
    }
}

class Dompet {
    int uang;

    void bayar(int jumlah, String untuk) {
        uang -= jumlah;
    }
}
