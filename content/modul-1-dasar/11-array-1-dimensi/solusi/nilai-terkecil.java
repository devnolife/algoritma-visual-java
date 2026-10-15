public class Main {
    public static void main(String[] args) {
        int[] nilai = {4, 9, 2, 7, 5};
        int min = nilai[0];                  // #awal
        for (int i = 1; i < nilai.length; i++) {
            if (nilai[i] < min) {            // #banding
                min = nilai[i];
            }
        }
        System.out.println("Nilai terkecil: " + min);
    }
}
