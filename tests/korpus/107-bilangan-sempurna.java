// Bilangan sempurna, berlebih, dan kurang berdasarkan jumlah pembagi sejati
public class Main {
    static int jumlahPembagi(int n) {
        if (n == 1) {
            return 0;
        }
        int total = 1;
        for (int i = 2; i * i <= n; i++) {
            if (n % i == 0) {
                total += i;
                if (i != n / i) {
                    total += n / i;
                }
            }
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.print("Sempurna sampai 30:");
        for (int n = 2; n <= 30; n++) {
            int jumlah = 0;
            for (int i = 1; i <= n / 2; i++) {
                if (n % i == 0) {
                    jumlah += i;
                }
            }
            if (jumlah == n) {
                System.out.print(" " + n);
            }
        }
        System.out.println();
        int[] uji = {6, 12, 28, 35, 496, 945, 8128, 1};
        for (int n : uji) {
            int s = jumlahPembagi(n);
            String jenis = s == n ? "sempurna" : s > n ? "berlebih" : "kurang";
            System.out.println(n + ": jumlah pembagi sejati " + s + " -> " + jenis);
        }
    }
}
