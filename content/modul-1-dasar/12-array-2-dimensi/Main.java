public class Main {
    public static void main(String[] args) {
        int[][] matriks = {
            {4, 1, 3},
            {2, 5, 9},
            {6, 7, 8}
        };
        for (int i = 0; i < matriks.length; i++) {   // #baris
            int jumlah = 0;   // #mulaiNol
            for (int j = 0; j < matriks[i].length; j++) {   // #kolom
                jumlah += matriks[i][j];
            }
            System.out.println("Jumlah baris " + i + ": " + jumlah);
        }
    }
}
