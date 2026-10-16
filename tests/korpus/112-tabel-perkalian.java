// Tabel perkalian 1-9 rata kanan dengan printf dan garis pemisah
public class Main {
    public static void main(String[] args) {
        int n = 9;
        System.out.print("   x|");
        for (int j = 1; j <= n; j++) {
            System.out.printf("%4d", j);
        }
        System.out.println();
        System.out.println("-".repeat(5 + 4 * n));
        for (int i = 1; i <= n; i++) {
            System.out.printf("%4d|", i);
            for (int j = 1; j <= n; j++) {
                System.out.printf("%4d", i * j);
            }
            System.out.println();
        }
        int jumlahDiagonal = 0;
        for (int i = 1; i <= n; i++) {
            jumlahDiagonal += i * i;
        }
        System.out.println("Jumlah diagonal (kuadrat) = " + jumlahDiagonal);
    }
}
