public class Main {
    public static void main(String[] args) {
        int[] nilai = {4, 9, 2, 7, 5};
        int maks = nilai[0];                 // #awal
        int jumlahLulus = 0;
        for (int i = 0; i < nilai.length; i++) {
            if (nilai[i] > maks) {           // #banding
                maks = nilai[i];
            }
            if (nilai[i] >= 5) {
                jumlahLulus++;
            }
        }
        System.out.println("Nilai terbesar: " + maks);
        System.out.println("Jumlah lulus: " + jumlahLulus);
    }
}
