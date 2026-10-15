public class Main {
    public static void main(String[] args) {
        int tinggi = 4;
        int bintang = 0;

        for (int baris = 1; baris <= tinggi; baris++) {    // #luar
            for (int kolom = 1; kolom <= baris; kolom++) { // #dalam
                System.out.print("*");
                bintang++;
            }
            System.out.println();                          // #ganti
        }
        System.out.println("Jumlah bintang: " + bintang);
    }
}
