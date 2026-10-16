// NullPointerException: membaca elemen dari variabel array int yang null
public class Main {
    static int[] data;

    static int jumlah(int[] a) {
        int total = 0;
        for (int x : a) {
            total += x;
        }
        return total;
    }

    public static void main(String[] args) {
        System.out.println("field data == null? " + (data == null));
        System.out.println("jumlah array berisi: " + jumlah(new int[] {1, 2, 3}));
        int[] lokal = null;
        System.out.println("lokal = " + lokal);
        System.out.println("elemen pertama: " + lokal[0]);
    }
}
