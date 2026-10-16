// Kelas bersarang static (Main.Titik) dan kelas top-level (Garis) dipakai bersama dari main
public class Main {
    static class Titik {
        int x;
        int y;

        Titik(int x, int y) {
            this.x = x;
            this.y = y;
        }

        int jarakManhattan(Titik lain) {
            return Math.abs(x - lain.x) + Math.abs(y - lain.y);
        }

        String teks() {
            return "(" + x + ", " + y + ")";
        }
    }

    public static void main(String[] args) {
        Titik a = new Titik(1, 2);
        Main.Titik b = new Main.Titik(4, 6);
        System.out.println("a = " + a.teks() + ", b = " + b.teks());
        System.out.println("Manhattan a-b = " + a.jarakManhattan(b));
        Garis g = new Garis(a, b);
        System.out.printf("Panjang garis = %.3f%n", g.panjang());
        System.out.println("Titik tengah = " + g.tengah().teks());
        a.x = 10;
        System.out.println("Setelah a.x = 10, garis dari " + g.awal.teks() + " ke " + g.akhir.teks());
        System.out.printf("Panjang garis sekarang = %.3f%n", g.panjang());
    }
}

class Garis {
    Main.Titik awal;
    Main.Titik akhir;

    Garis(Main.Titik awal, Main.Titik akhir) {
        this.awal = awal;
        this.akhir = akhir;
    }

    double panjang() {
        int dx = akhir.x - awal.x;
        int dy = akhir.y - awal.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    Main.Titik tengah() {
        return new Main.Titik((awal.x + akhir.x) / 2, (awal.y + akhir.y) / 2);
    }
}
