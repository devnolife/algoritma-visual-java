public class Main {
    static int panggilan = 0;

    public static void main(String[] args) {
        int n = 13;
        boolean cepat = true;
        long hasil;
        if (cepat) hasil = pangkatCepat(2, n);
        else hasil = pangkatBiasa(2, n);
        System.out.println("2^" + n + " = " + hasil);
        System.out.println("Panggilan: " + panggilan);
        System.out.println("5^0 = " + pangkatCepat(5, 0));
    }

    // a^n = a^(n/2) * a^(n/2), dikali a sekali lagi bila n ganjil
    static long pangkatCepat(int a, int n) {
        panggilan++;
        if (n == 0) return 1;   // #dasar
        long setengah = pangkatCepat(a, n / 2);   // #pecah
        long hasil = setengah * setengah;   // #gabung
        if (n % 2 == 1) hasil = hasil * a;
        return hasil;
    }

    // a^n = a * a^(n-1): masalahnya hanya berkurang satu
    static long pangkatBiasa(int a, int n) {
        panggilan++;
        if (n == 0) return 1;
        return a * pangkatBiasa(a, n - 1);
    }
}
