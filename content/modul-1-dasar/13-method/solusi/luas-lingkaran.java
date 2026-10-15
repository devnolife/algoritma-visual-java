public class Main {
    public static void main(String[] args) {
        sapa("Rani");
        sapa("Budi");
        int luas = luasPersegiPanjang(5, 3);
        System.out.println("Luas: " + luas);

        int skor = 10;
        tambahSatu(skor);
        System.out.println("skor = " + skor);

        int[] nilai = {5, 8, 3};
        gandakanPertama(nilai);
        System.out.println("nilai[0] = " + nilai[0]);

        System.out.printf("Luas lingkaran: %.2f%n", luasLingkaran(7));
        System.out.printf("Luas lingkaran: %.2f%n", luasLingkaran(10));
    }

    static void sapa(String nama) {
        System.out.println("Halo, " + nama + "!");
    }

    static int luasPersegiPanjang(int panjang, int lebar) {
        int hasil = panjang * lebar;
        return hasil;   // #kembali
    }

    static void tambahSatu(int angka) {
        angka = angka + 1;   // #salinan
    }

    static void gandakanPertama(int[] data) {
        data[0] = data[0] * 2;   // #referensi
    }

    static double luasLingkaran(double r) {
        return Math.PI * r * r;
    }
}
