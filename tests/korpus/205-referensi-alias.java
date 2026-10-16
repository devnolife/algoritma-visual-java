// Dua variabel menunjuk objek yang sama: perubahan lewat satu terlihat lewat yang lain; == membandingkan referensi
public class Main {
    static class Rekening {
        String pemilik;
        int saldo;

        Rekening(String pemilik, int saldo) {
            this.pemilik = pemilik;
            this.saldo = saldo;
        }
    }

    public static void main(String[] args) {
        Rekening a = new Rekening("Ani", 100);
        Rekening b = a;
        Rekening c = new Rekening("Ani", 100);
        System.out.println("a == b: " + (a == b));
        System.out.println("a == c: " + (a == c));
        b.saldo += 50;
        System.out.println("saldo a = " + a.saldo + ", saldo b = " + b.saldo + ", saldo c = " + c.saldo);
        b = new Rekening("Budi", 10);
        System.out.println("setelah b diganti: a.pemilik = " + a.pemilik + ", b.pemilik = " + b.pemilik);
        System.out.println("a == b: " + (a == b));
        Rekening[] daftar = {a, a, c};
        daftar[0].saldo = 999;
        System.out.println("daftar[1].saldo = " + daftar[1].saldo + ", daftar[2].saldo = " + daftar[2].saldo);
        Rekening d = c;
        c = null;
        System.out.println("c = " + c + ", d.pemilik = " + d.pemilik + ", d.saldo = " + d.saldo);
        System.out.println("isi a dan d sama? " + (a.pemilik.equals(d.pemilik) && a.saldo == d.saldo));
    }
}
