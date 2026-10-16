// Method static (utilitas, tanpa objek) dan method instance (memakai field objek) dipanggil dari tempat berbeda
public class Main {
    public static void main(String[] args) {
        System.out.println("Konversi 100 C = " + Suhu.celciusKeFahrenheit(100) + " F");
        System.out.println("Konversi 212 F = " + Suhu.fahrenheitKeCelcius(212) + " C");
        Suhu pagi = new Suhu("pagi", 24.5);
        Suhu siang = new Suhu("siang", 33.0);
        pagi.tampil();
        siang.tampil();
        System.out.println("Selisih = " + siang.selisih(pagi));
        System.out.println("Lebih panas: " + Suhu.lebihPanas(pagi, siang).label);
        System.out.println("Jumlah objek Suhu: " + Suhu.dibuat);
        siang.naik(1.5);
        siang.tampil();
    }
}

class Suhu {
    static int dibuat = 0;
    String label;
    double celcius;

    Suhu(String label, double celcius) {
        this.label = label;
        this.celcius = celcius;
        dibuat++;
    }

    static double celciusKeFahrenheit(double c) {
        return c * 9 / 5 + 32;
    }

    static double fahrenheitKeCelcius(double f) {
        return (f - 32) * 5 / 9;
    }

    static Suhu lebihPanas(Suhu a, Suhu b) {
        return a.celcius >= b.celcius ? a : b;
    }

    double selisih(Suhu lain) {
        return Math.abs(celcius - lain.celcius);
    }

    void naik(double derajat) {
        celcius += derajat;
    }

    void tampil() {
        System.out.println(label + ": " + celcius + " C = " + celciusKeFahrenheit(celcius) + " F");
    }
}
