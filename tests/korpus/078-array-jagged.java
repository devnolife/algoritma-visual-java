// Array bergerigi (jagged): baris dengan panjang berbeda dan baris null
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[][] segitiga = new int[4][];
        for (int i = 0; i < segitiga.length; i++) {
            segitiga[i] = new int[i + 1];
            for (int j = 0; j <= i; j++) {
                segitiga[i][j] = (i + 1) * 10 + j;
            }
        }
        System.out.println(Arrays.deepToString(segitiga));
        for (int[] baris : segitiga) {
            System.out.println("panjang " + baris.length + ": " + Arrays.toString(baris));
        }
        int[][] belumDiisi = new int[3][];
        System.out.println("Baris null: " + Arrays.deepToString(belumDiisi));
        belumDiisi[1] = new int[] {5, 6};
        System.out.println("Sebagian: " + Arrays.deepToString(belumDiisi));
        System.out.println("belumDiisi[0] == null? " + (belumDiisi[0] == null));
        String[][] kelompok = {
            {"Ani"},
            {"Budi", "Cici", "Dodi"},
            {},
            {"Eko", "Fani"}
        };
        int total = 0;
        for (int i = 0; i < kelompok.length; i++) {
            total += kelompok[i].length;
            System.out.println("Kelompok " + (i + 1) + ": " + String.join(", ", kelompok[i]) + " (" + kelompok[i].length + ")");
        }
        System.out.println("Total anggota: " + total);
        char[][] papan = {"abc".toCharArray(), "de".toCharArray()};
        System.out.println(Arrays.deepToString(papan));
        int[][] tukar = {{1, 2, 3}, {4}};
        int[] sementara = tukar[0];
        tukar[0] = tukar[1];
        tukar[1] = sementara;
        System.out.println("Setelah tukar baris: " + Arrays.deepToString(tukar));
    }
}
