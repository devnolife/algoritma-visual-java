// NPE pada array: baris array 2D yang belum dibuat (simpan, baca, length), indeks berupa ekspresi, field static array null, dan array lokal null
public class Main {
    static int[] cadangan;

    public static void main(String[] args) {
        int[][] jadwal = new int[3][];
        jadwal[0] = new int[] {7, 8};
        System.out.println("jadwal[0][1] = " + jadwal[0][1] + ", jadwal[1] = " + jadwal[1]);
        try {
            jadwal[1][0] = 9;
        } catch (NullPointerException e) {
            System.out.println("simpan: " + e.getMessage());
        }
        try {
            System.out.println(jadwal[2][0]);
        } catch (NullPointerException e) {
            System.out.println("baca: " + e.getMessage());
        }
        int i = 1;
        try {
            System.out.println(jadwal[i].length);
        } catch (NullPointerException e) {
            System.out.println("length: " + e.getMessage());
        }
        try {
            System.out.println(jadwal[i + 1][0]);
        } catch (NullPointerException e) {
            System.out.println("indeks ekspresi: " + e.getMessage());
        }
        try {
            cadangan[0] = 1;
        } catch (NullPointerException e) {
            System.out.println("field static: " + e.getMessage());
        }
        int[] lokal = null;
        int total = 10;
        total += lokal[0];
        System.out.println(total);
    }
}
