// Transpos matriks persegi dan non-persegi, serta matriks simetris
import java.util.Arrays;

public class Main {
    static int[][] transpos(int[][] m) {
        int[][] t = new int[m[0].length][m.length];
        for (int i = 0; i < m.length; i++) {
            for (int j = 0; j < m[0].length; j++) {
                t[j][i] = m[i][j];
            }
        }
        return t;
    }

    static boolean simetris(int[][] m) {
        for (int i = 0; i < m.length; i++) {
            for (int j = 0; j < i; j++) {
                if (m[i][j] != m[j][i]) {
                    return false;
                }
            }
        }
        return true;
    }

    static void cetak(int[][] m) {
        for (int[] baris : m) {
            for (int v : baris) {
                System.out.printf("%4d", v);
            }
            System.out.println();
        }
    }

    public static void main(String[] args) {
        int[][] a = {{1, 2, 3}, {4, 5, 6}};
        System.out.println("A (2x3):");
        cetak(a);
        int[][] at = transpos(a);
        System.out.println("A transpos (3x2):");
        cetak(at);
        int[][] b = {{1, 7, 3}, {7, 4, -5}, {3, -5, 6}};
        System.out.println("B simetris? " + simetris(b));
        System.out.println("A x A^T simetris? " + simetris(new int[][] {{14, 32}, {32, 77}}));
        int[][] c = {{1, 2}, {3, 4}};
        for (int i = 0; i < c.length; i++) {
            for (int j = i + 1; j < c.length; j++) {
                int tmp = c[i][j];
                c[i][j] = c[j][i];
                c[j][i] = tmp;
            }
        }
        System.out.println("Transpos di tempat: " + Arrays.deepToString(c));
        System.out.println("Transpos dua kali kembali: " + Arrays.deepToString(transpos(transpos(a))));
    }
}
