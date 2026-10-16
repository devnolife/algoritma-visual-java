// Objek sebagai parameter: perubahan isi objek terlihat oleh pemanggil, tetapi mengganti referensi parameter tidak
public class Main {
    static class Kotak {
        int isi;

        Kotak(int isi) {
            this.isi = isi;
        }
    }

    static void tambah(Kotak k, int n) {
        k.isi += n;
        System.out.println("  di tambah: isi = " + k.isi);
    }

    static void ganti(Kotak k) {
        k = new Kotak(-1);
        System.out.println("  di ganti: isi = " + k.isi);
    }

    static void tukar(Kotak a, Kotak b) {
        Kotak t = a;
        a = b;
        b = t;
        System.out.println("  di tukar: a = " + a.isi + ", b = " + b.isi);
    }

    static void tukarIsi(Kotak a, Kotak b) {
        int t = a.isi;
        a.isi = b.isi;
        b.isi = t;
    }

    static Kotak gandakan(Kotak k) {
        return new Kotak(k.isi * 2);
    }

    public static void main(String[] args) {
        Kotak x = new Kotak(10);
        Kotak y = new Kotak(20);
        tambah(x, 5);
        System.out.println("x.isi = " + x.isi);
        ganti(x);
        System.out.println("x.isi setelah ganti = " + x.isi);
        tukar(x, y);
        System.out.println("x.isi = " + x.isi + ", y.isi = " + y.isi);
        tukarIsi(x, y);
        System.out.println("setelah tukarIsi: x.isi = " + x.isi + ", y.isi = " + y.isi);
        Kotak z = gandakan(y);
        System.out.println("z.isi = " + z.isi + ", y.isi = " + y.isi + ", z == y: " + (z == y));
        Kotak[] semua = {x, y, z};
        for (Kotak k : semua) {
            tambah(k, 1);
        }
        System.out.println(x.isi + " " + y.isi + " " + z.isi);
    }
}
