// System.exit(3) di tengah program: pernyataan setelahnya tidak dijalankan
public class Main {
    static void periksa(int nilai) {
        if (nilai < 0) {
            System.out.println("Nilai negatif ditemukan: " + nilai + ", program dihentikan");
            System.exit(3);
        }
        System.out.println("Nilai " + nilai + " valid");
    }

    public static void main(String[] args) {
        int[] data = {5, 12, -4, 8};
        for (int d : data) {
            periksa(d);
        }
        System.out.println("Semua data valid");
    }
}
