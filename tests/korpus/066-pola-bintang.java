// Pola bintang: segitiga siku, segitiga terbalik, piramida, dan belah ketupat
public class Main {
    public static void main(String[] args) {
        int n = 4;
        for (int i = 1; i <= n; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
        System.out.println("--");
        for (int i = n; i >= 1; i--) {
            for (int j = 1; j <= i; j++) {
                System.out.print("* ");
            }
            System.out.println();
        }
        System.out.println("--");
        for (int i = 1; i <= n; i++) {
            for (int s = 0; s < n - i; s++) {
                System.out.print(" ");
            }
            for (int j = 0; j < 2 * i - 1; j++) {
                System.out.print("*");
            }
            System.out.println();
        }
        System.out.println("--");
        int m = 3;
        for (int i = -m; i <= m; i++) {
            int jarak = Math.abs(i);
            String baris = " ".repeat(jarak) + "*".repeat(2 * (m - jarak) + 1);
            System.out.println(baris);
        }
        System.out.println("--");
        for (int i = 1; i <= 4; i++) {
            for (int j = 1; j <= 4; j++) {
                System.out.print((i == 1 || i == 4 || j == 1 || j == 4) ? "#" : ".");
            }
            System.out.println();
        }
    }
}
