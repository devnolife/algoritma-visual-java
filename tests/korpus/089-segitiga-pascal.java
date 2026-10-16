// Segitiga Pascal dengan array bergerigi dan rumus kombinasi
public class Main {
    static long kombinasi(int n, int r) {
        long hasil = 1;
        for (int i = 1; i <= r; i++) {
            hasil = hasil * (n - r + i) / i;
        }
        return hasil;
    }

    public static void main(String[] args) {
        int baris = 7;
        int[][] pascal = new int[baris][];
        for (int i = 0; i < baris; i++) {
            pascal[i] = new int[i + 1];
            pascal[i][0] = 1;
            pascal[i][i] = 1;
            for (int j = 1; j < i; j++) {
                pascal[i][j] = pascal[i - 1][j - 1] + pascal[i - 1][j];
            }
        }
        for (int i = 0; i < baris; i++) {
            String spasi = " ".repeat((baris - i - 1) * 2);
            String isi = "";
            for (int j = 0; j <= i; j++) {
                isi += String.format("%4d", pascal[i][j]);
            }
            System.out.println(spasi + isi);
        }
        int jumlahBaris6 = 0;
        for (int v : pascal[6]) {
            jumlahBaris6 += v;
        }
        System.out.println("Jumlah baris ke-6 = " + jumlahBaris6 + " = 2^6");
        System.out.println("C(6,3) = " + kombinasi(6, 3) + ", pascal[6][3] = " + pascal[6][3]);
        System.out.println("C(30,15) = " + kombinasi(30, 15));
    }
}
