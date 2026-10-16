// Urutan keluaran try-catch-finally: finally selalu berjalan, baik tanpa exception, dengan exception tertangkap, saat return, continue, maupun break
public class Main {
    static int langkah = 0;

    static void cetak(String s) {
        langkah++;
        System.out.println(langkah + ". " + s);
    }

    static int bagi(int a, int b) {
        cetak("mulai bagi(" + a + ", " + b + ")");
        try {
            int hasil = a / b;
            cetak("hasil dihitung: " + hasil);
            return hasil;
        } catch (ArithmeticException e) {
            cetak("catch: " + e.getMessage());
            return -1;
        } finally {
            cetak("finally bagi(" + a + ", " + b + ")");
        }
    }

    public static void main(String[] args) {
        cetak("main mulai");
        int x = bagi(10, 2);
        cetak("x = " + x);
        int y = bagi(1, 0);
        cetak("y = " + y);
        try {
            cetak("try luar");
            int[] a = new int[2];
            a[bagi(9, 3)] = 1;
            cetak("tidak tercetak");
        } catch (ArrayIndexOutOfBoundsException e) {
            cetak("catch luar: " + e.getMessage());
        } finally {
            cetak("finally luar");
        }
        for (int i = 0; i < 3; i++) {
            try {
                if (i == 1) {
                    cetak("continue di i=" + i);
                    continue;
                }
                if (i == 2) {
                    cetak("break di i=" + i);
                    break;
                }
                cetak("badan loop i=" + i);
            } finally {
                cetak("finally loop i=" + i);
            }
        }
        cetak("main selesai");
    }
}
