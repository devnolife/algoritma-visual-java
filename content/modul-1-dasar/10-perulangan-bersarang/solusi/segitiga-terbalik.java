public class Main {
    public static void main(String[] args) {
        int tinggi = 4;
        int bintang = 0;

        for (int baris = tinggi; baris >= 1; baris--) {
            for (int kolom = 1; kolom <= baris; kolom++) {
                System.out.print("*");
                bintang++;
            }
            System.out.println();
        }
        System.out.println("Jumlah bintang: " + bintang);
    }
}
