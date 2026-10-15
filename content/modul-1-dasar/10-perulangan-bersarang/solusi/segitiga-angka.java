public class Main {
    public static void main(String[] args) {
        int tinggi = 4;

        for (int baris = 1; baris <= tinggi; baris++) {
            for (int kolom = 1; kolom <= baris; kolom++) {
                System.out.print(kolom);
            }
            System.out.println();
        }
    }
}
