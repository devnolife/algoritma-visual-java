// NullPointerException: menulis ke baris array 2D bergerigi yang belum dibuat
public class Main {
    public static void main(String[] args) {
        int[][] tabel = new int[3][];
        tabel[0] = new int[] {1, 2};
        tabel[2] = new int[4];
        System.out.println("Panjang baris 0: " + tabel[0].length);
        System.out.println("Baris 1 null? " + (tabel[1] == null));
        for (int i = 0; i < tabel.length; i++) {
            System.out.println("Baris " + i + " ...");
            tabel[i][0] = i * 10;
            System.out.println("  terisi " + tabel[i][0]);
        }
        System.out.println("tidak tercetak");
    }
}
