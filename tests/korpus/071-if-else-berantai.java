// if-else berantai, if bersarang, dan dangling else pada kategori BMI
public class Main {
    static String kategoriBmi(double bmi) {
        if (bmi < 18.5) {
            return "kurus";
        } else if (bmi < 25.0) {
            return "normal";
        } else if (bmi < 30.0) {
            return "gemuk";
        } else {
            return "obesitas";
        }
    }

    public static void main(String[] args) {
        String[] nama = {"Ani", "Budi", "Citra", "Dodi"};
        double[] berat = {45, 68, 80, 110};
        double[] tinggi = {1.60, 1.75, 1.65, 1.80};
        for (int i = 0; i < nama.length; i++) {
            double bmi = berat[i] / (tinggi[i] * tinggi[i]);
            System.out.printf("%-6s BMI %.2f -> %s%n", nama[i], bmi, kategoriBmi(bmi));
        }
        int x = 5, y = -3;
        if (x > 0)
            if (y > 0)
                System.out.println("keduanya positif");
            else
                System.out.println("else menempel ke if terdekat (y tidak positif)");
        int suhu = 32;
        boolean hujan = false;
        if (suhu > 30) {
            if (hujan) {
                System.out.println("Panas dan hujan");
            } else {
                System.out.println("Panas dan cerah");
            }
        } else if (suhu < 20) {
            System.out.println("Dingin");
        } else {
            System.out.println("Sejuk");
        }
        int tahun = 2100;
        if (tahun % 400 == 0) {
            System.out.println(tahun + " kabisat");
        } else if (tahun % 100 == 0) {
            System.out.println(tahun + " bukan kabisat (kelipatan 100)");
        } else if (tahun % 4 == 0) {
            System.out.println(tahun + " kabisat");
        } else {
            System.out.println(tahun + " bukan kabisat");
        }
        if (x > 3 && y < 0 || x == 0) System.out.println("kondisi majemuk benar");
    }
}
