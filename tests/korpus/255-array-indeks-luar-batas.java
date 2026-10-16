// ArrayIndexOutOfBoundsException untuk indeks negatif, sama dengan panjang, array 2D, dan array kosong; loop terakhir tidak ditangkap
public class Main {
    static int ambil(int[] a, int i) {
        return a[i];
    }

    public static void main(String[] args) {
        int[] nilai = {5, 10, 15};
        int[][] grid = new int[2][4];
        int[] coba = {0, 2, 3, -1, 100};
        for (int i : coba) {
            try {
                System.out.println("nilai[" + i + "] = " + ambil(nilai, i));
            } catch (ArrayIndexOutOfBoundsException e) {
                System.out.println("nilai[" + i + "] gagal: " + e.getMessage());
            }
        }
        try {
            grid[1][4] = 9;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("grid[1][4]: " + e);
        }
        try {
            grid[2][0] = 9;
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("grid[2][0]: " + e);
        }
        String[] kosong = new String[0];
        try {
            System.out.println(kosong[0]);
        } catch (ArrayIndexOutOfBoundsException e) {
            System.out.println("array kosong: " + e.getMessage());
        }
        int total = 0;
        for (int i = 0; i <= nilai.length; i++) {
            total += nilai[i];
            System.out.println("total sampai indeks " + i + " = " + total);
        }
    }
}
