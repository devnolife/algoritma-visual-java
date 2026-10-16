// IllegalArgumentException dari method validasi: ditangkap di dalam loop, lalu tidak ditangkap pada panggilan terakhir (stack trace tiga tingkat)
public class Main {
    static double luasSegitiga(double a, double b, double c) {
        if (a <= 0 || b <= 0 || c <= 0) {
            throw new IllegalArgumentException("sisi harus positif: " + a + ", " + b + ", " + c);
        }
        if (a + b <= c || a + c <= b || b + c <= a) {
            throw new IllegalArgumentException("bukan segitiga: " + a + ", " + b + ", " + c);
        }
        double s = (a + b + c) / 2;
        return Math.sqrt(s * (s - a) * (s - b) * (s - c));
    }

    static void cetakLuas(double a, double b, double c) {
        System.out.printf("luas(%.1f, %.1f, %.1f) = %.3f%n", a, b, c, luasSegitiga(a, b, c));
    }

    public static void main(String[] args) {
        double[][] sisi = {{3, 4, 5}, {1, 1, 3}, {2, -1, 2}, {6, 6, 6}};
        for (double[] s : sisi) {
            try {
                cetakLuas(s[0], s[1], s[2]);
            } catch (IllegalArgumentException e) {
                System.out.println("tidak valid: " + e.getMessage());
            }
        }
        cetakLuas(10, 2, 3);
    }
}
