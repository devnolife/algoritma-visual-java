// Method yang mengembalikan objek baru (pecahan disederhanakan) sehingga objek asal tidak berubah
public class Main {
    public static void main(String[] args) {
        Pecahan a = new Pecahan(1, 2);
        Pecahan b = new Pecahan(3, 4);
        Pecahan c = a.tambah(b);
        System.out.println(a.teks() + " + " + b.teks() + " = " + c.teks());
        System.out.println(a.teks() + " - " + b.teks() + " = " + a.kurang(b).teks());
        System.out.println(a.teks() + " x " + b.teks() + " = " + a.kali(b).teks());
        System.out.println(a.teks() + " : " + b.teks() + " = " + a.bagi(b).teks());
        Pecahan d = new Pecahan(10, -4);
        System.out.println("10/-4 disederhanakan = " + d.teks());
        Pecahan jumlah = new Pecahan(0, 1);
        for (int n = 1; n <= 6; n++) {
            jumlah = jumlah.tambah(new Pecahan(1, n * (n + 1)));
            System.out.println("jumlah 1/(n(n+1)) sampai n=" + n + " : " + jumlah.teks() + " = " + jumlah.nilai());
        }
        System.out.println("a masih " + a.teks() + ", b masih " + b.teks());
    }
}

class Pecahan {
    int pembilang;
    int penyebut;

    Pecahan(int pembilang, int penyebut) {
        if (penyebut < 0) {
            pembilang = -pembilang;
            penyebut = -penyebut;
        }
        int f = fpb(Math.abs(pembilang), penyebut);
        if (f == 0) {
            f = 1;
        }
        this.pembilang = pembilang / f;
        this.penyebut = penyebut / f;
    }

    static int fpb(int a, int b) {
        while (b != 0) {
            int t = a % b;
            a = b;
            b = t;
        }
        return a;
    }

    Pecahan tambah(Pecahan o) {
        return new Pecahan(pembilang * o.penyebut + o.pembilang * penyebut, penyebut * o.penyebut);
    }

    Pecahan kurang(Pecahan o) {
        return new Pecahan(pembilang * o.penyebut - o.pembilang * penyebut, penyebut * o.penyebut);
    }

    Pecahan kali(Pecahan o) {
        return new Pecahan(pembilang * o.pembilang, penyebut * o.penyebut);
    }

    Pecahan bagi(Pecahan o) {
        return new Pecahan(pembilang * o.penyebut, penyebut * o.pembilang);
    }

    double nilai() {
        return (double) pembilang / penyebut;
    }

    String teks() {
        return penyebut == 1 ? "" + pembilang : pembilang + "/" + penyebut;
    }
}
