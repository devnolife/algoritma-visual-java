public class Main {
    static int panggilan = 0;

    public static void main(String[] args) {
        int n = 8;
        boolean cepat = true;
        long hasil;
        if (cepat) hasil = pangkatCepat(2, n);
        else hasil = pangkatBiasa(2, n);
        System.out.println("2^" + n + " = " + hasil);
        System.out.println("Panggilan: " + panggilan);
        int[] data = {12, 49, 36, 23, 10, 47, 34};
        int terbesar = maks(data, 0, data.length - 1);
        System.out.println("Maksimum: " + terbesar);
    }

    // a^n = a^(n/2) * a^(n/2): masalahnya dibelah dua
    // (versi ini baru benar bila n = 1, 2, 4, 8, ...)
    static long pangkatCepat(int a, int n) {
        panggilan++;
        if (n == 1) return a;   // #dasar
        long setengah = pangkatCepat(a, n / 2);   // #pecah
        return setengah * setengah;   // #gabung
    }

    // a^n = a * a^(n-1): masalahnya hanya berkurang satu
    static long pangkatBiasa(int a, int n) {
        panggilan++;
        if (n == 0) return 1;
        return a * pangkatBiasa(a, n - 1);
    }

    // maksimum data[kiri..kanan]: belah dua, cari maksimum setiap bagian, ambil yang lebih besar
    static int maks(int[] data, int kiri, int kanan) {
        if (kiri == kanan) return data[kiri];
        int tengah = (kiri + kanan) / 2;
        int maksKiri = maks(data, kiri, tengah);
        int maksKanan = maks(data, tengah + 1, kanan);
        return Math.max(maksKiri, maksKanan);
    }
}
