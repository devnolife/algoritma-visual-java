// Perkalian matriks 3x3, matriks identitas, dan penjumlahan matriks
public class Main {
    static int[][] kali(int[][] a, int[][] b) {
        int n = a.length;
        int m = b[0].length;
        int[][] hasil = new int[n][m];
        for (int i = 0; i < n; i++) {
            for (int j = 0; j < m; j++) {
                int total = 0;
                for (int k = 0; k < b.length; k++) {
                    total += a[i][k] * b[k][j];
                }
                hasil[i][j] = total;
            }
        }
        return hasil;
    }

    static void cetak(String judul, int[][] m) {
        System.out.println(judul);
        for (int[] baris : m) {
            String teks = "";
            for (int v : baris) {
                teks += String.format("%5d", v);
            }
            System.out.println(teks);
        }
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2, 3}, {4, 5, 6}, {7, 8, 9}};
        int[][] b = {{9, 8, 7}, {6, 5, 4}, {3, 2, 1}};
        int[][] identitas = new int[3][3];
        for (int i = 0; i < 3; i++) {
            identitas[i][i] = 1;
        }
        cetak("A x B:", kali(a, b));
        cetak("B x A:", kali(b, a));
        cetak("A x I:", kali(a, identitas));
        int[][] jumlah = new int[3][3];
        for (int i = 0; i < 3; i++) {
            for (int j = 0; j < 3; j++) {
                jumlah[i][j] = a[i][j] + b[i][j];
            }
        }
        cetak("A + B:", jumlah);
        int[][] baris = {{1, 2, 3}};
        int[][] kolom = {{4}, {5}, {6}};
        cetak("1x3 x 3x1:", kali(baris, kolom));
        cetak("3x1 x 1x3:", kali(kolom, baris));
    }
}
