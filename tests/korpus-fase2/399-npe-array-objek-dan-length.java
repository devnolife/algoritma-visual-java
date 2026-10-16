// NPE pada array objek: elemen null dengan indeks konstanta dan variabel ("nama[1]", "nama[i]"), baris array 2D null, dan length dari array null hasil method
public class Main {
    static String[] muat(boolean ada) {
        return ada ? new String[] {"x", "y"} : null;
    }

    public static void main(String[] args) {
        String[] nama = new String[3];
        nama[0] = "Ani";
        System.out.println("nama[0] = " + nama[0].toUpperCase());
        try {
            System.out.println(nama[1].length());
        } catch (NullPointerException e) {
            System.out.println("1: " + e.getMessage());
        }
        for (int i = 0; i < nama.length; i++) {
            try {
                System.out.println("nama[" + i + "] panjang " + nama[i].length());
            } catch (NullPointerException e) {
                System.out.println("2: " + e.getMessage());
            }
        }
        String[][] tabel = new String[2][];
        try {
            System.out.println(tabel[1][0]);
        } catch (NullPointerException e) {
            System.out.println("3: " + e.getMessage());
        }
        System.out.println("muat(true).length = " + muat(true).length);
        System.out.println(muat(false).length);
    }
}
