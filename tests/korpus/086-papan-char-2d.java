// Papan tic-tac-toe char[][]: deepToString, pengecekan pemenang, dan Arrays.equals per baris
import java.util.Arrays;

public class Main {
    static char pemenang(char[][] p) {
        for (int i = 0; i < 3; i++) {
            if (p[i][0] != '.' && p[i][0] == p[i][1] && p[i][1] == p[i][2]) {
                return p[i][0];
            }
            if (p[0][i] != '.' && p[0][i] == p[1][i] && p[1][i] == p[2][i]) {
                return p[0][i];
            }
        }
        if (p[1][1] != '.' && ((p[0][0] == p[1][1] && p[1][1] == p[2][2]) || (p[0][2] == p[1][1] && p[1][1] == p[2][0]))) {
            return p[1][1];
        }
        return '-';
    }

    static void cetak(char[][] p) {
        for (char[] baris : p) {
            System.out.println(new String(baris));
        }
    }

    public static void main(String[] args) {
        char[][] papan = new char[3][3];
        for (char[] baris : papan) {
            Arrays.fill(baris, '.');
        }
        int[][] langkah = {{1, 1}, {0, 0}, {2, 2}, {0, 2}, {0, 1}, {2, 1}, {1, 0}, {1, 2}, {2, 0}};
        char giliran = 'X';
        for (int[] l : langkah) {
            papan[l[0]][l[1]] = giliran;
            char m = pemenang(papan);
            if (m != '-') {
                System.out.println("Pemenang: " + m);
                break;
            }
            giliran = giliran == 'X' ? 'O' : 'X';
        }
        cetak(papan);
        System.out.println(Arrays.deepToString(papan));
        System.out.println("Baris 0 sama dengan baris 2? " + Arrays.equals(papan[0], papan[2]));
        String[][] jadwal = {{"Senin", "Algoritma"}, {"Rabu", "Basis Data"}};
        System.out.println(Arrays.deepToString(jadwal));
    }
}
