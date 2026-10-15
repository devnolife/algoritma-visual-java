public class Main {
    public static void main(String[] args) {
        int[] nilai = {4, 9, 2, 7, 5};
        int maks = nilai[0];   // #awal
        for (int i = 1; i < nilai.length; i++) {
            if (nilai[i] > maks) {   // #banding
                maks = nilai[i];
            }
        }
        System.out.println("Nilai terbesar: " + maks);
    }
}
