// ArithmeticException merambat melewati beberapa method (masing-masing dengan finally) sampai ditangkap di main; double tidak melempar
public class Main {
    static int rataRata(int[] nilai, int jumlah) {
        try {
            int total = 0;
            for (int n : nilai) {
                total += n;
            }
            return total / jumlah;
        } finally {
            System.out.println("    rataRata selesai (jumlah=" + jumlah + ")");
        }
    }

    static String laporan(String nama, int[] nilai) {
        try {
            return nama + ": " + rataRata(nilai, nilai.length);
        } finally {
            System.out.println("  laporan " + nama + " selesai");
        }
    }

    public static void main(String[] args) {
        String[] kelas = {"A", "B", "C"};
        int[][] nilai = {{80, 75, 90}, {}, {60, 65}};
        for (int i = 0; i < kelas.length; i++) {
            try {
                System.out.println(laporan(kelas[i], nilai[i]));
            } catch (ArithmeticException e) {
                System.out.println("kelas " + kelas[i] + " gagal: " + e.getMessage());
            }
        }
        long besar = 10;
        try {
            System.out.println("long modulo nol: " + (besar % 0L));
        } catch (ArithmeticException e) {
            System.out.println("long: " + e.getMessage());
        }
        System.out.println("double tidak melempar: " + (10.0 / 0) + " " + (0.0 / 0) + " " + (-1 % 0.0));
    }
}
