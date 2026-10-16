// Konversi suhu Celsius-Fahrenheit-Kelvin dan jebakan pembagian int 5 / 9
public class Main {
    static double keFahrenheit(double c) {
        return c * 9 / 5 + 32;
    }

    static double keCelsius(double f) {
        return (f - 32) * 5 / 9;
    }

    public static void main(String[] args) {
        System.out.println("Celsius  Fahrenheit  Kelvin");
        for (int c = -40; c <= 100; c += 20) {
            System.out.printf("%7d  %10.1f  %6.2f%n", c, keFahrenheit(c), c + 273.15);
        }
        double f = 98.6;
        System.out.println(f + " F = " + keCelsius(f) + " C");
        double salah = (f - 32) * (5 / 9);
        System.out.println("Pakai (5 / 9): " + salah + " C  <- 5 / 9 bernilai 0");
        double benar = (f - 32) * (5.0 / 9);
        System.out.println("Pakai (5.0 / 9): " + benar + " C");
        int fInt = 212;
        int cInt = (fInt - 32) * 5 / 9;
        System.out.println(fInt + " F = " + cInt + " C (int)");
        int cTerbalik = (fInt - 32) / 9 * 5;
        System.out.println("Urutan berbeda (/ 9 dulu): " + cTerbalik);
        System.out.println("37.5 C = " + keFahrenheit(37.5) + " F");
    }
}
