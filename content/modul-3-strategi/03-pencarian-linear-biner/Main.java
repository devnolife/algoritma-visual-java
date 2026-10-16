public class Main {
    static int perbandingan = 0;

    public static void main(String[] args) {
        int n = 7;
        boolean biner = true;   // false: pencarian linear
        int[] data = new int[n];
        for (int i = 0; i < n; i++) {
            data[i] = i * 3 + 2;   // terurut: 2, 5, 8, ...
        }
        int cari = data[n - 1];   // #cari
        int posisi;
        if (biner) {
            posisi = cariBiner(data, cari);
        } else {
            posisi = cariLinear(data, cari);
        }
        System.out.println("Indeks " + cari + ": " + posisi);
        System.out.println("Perbandingan: " + perbandingan);
    }

    static int cariLinear(int[] data, int cari) {
        for (int i = 0; i < data.length; i++) {
            perbandingan++;
            if (data[i] == cari) return i;
        }
        return -1;
    }

    static int cariBiner(int[] data, int cari) {
        int kiri = 0;
        int kanan = data.length - 1;
        while (kiri <= kanan) {
            int tengah = (kiri + kanan) / 2;   // #tengah
            perbandingan++;
            if (data[tengah] == cari) return tengah;
            if (data[tengah] < cari) {
                kiri = tengah + 1;   // #buang
            } else {
                kanan = tengah - 1;
            }
        }
        return -1;
    }
}
