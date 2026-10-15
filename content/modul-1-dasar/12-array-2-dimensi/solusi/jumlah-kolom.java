public class Main {
    public static void main(String[] args) {
        int[][] matriks = {
            {4, 1, 3},
            {2, 5, 9},
            {6, 7, 8}
        };
        for (int j = 0; j < matriks[0].length; j++) {
            int jumlah = 0;
            for (int i = 0; i < matriks.length; i++) {
                jumlah += matriks[i][j];
            }
            System.out.println("Jumlah kolom " + j + ": " + jumlah);
        }
    }
}
