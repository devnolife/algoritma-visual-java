// %b pada nilai non-boolean, %c dengan kode int, %S, %n, dan System.out.format
public class Main {
    public static void main(String[] args) {
        String kosong = null;
        System.out.printf("%b %b %b %b%n", true, 0, "", kosong);
        System.out.printf("%B %b%n", "teks", 3.5);
        for (int kode = 72; kode <= 76; kode++) {
            System.out.printf("%c", kode);
        }
        System.out.printf("%n");
        char awal = 'a';
        System.out.printf("%c%c%c%n", awal, awal + 1, (char) (awal + 2));
        System.out.printf("%S dan %s%n", "campuran Huruf", "Tetap");
        System.out.printf("[%5c] [%-5c]%n", 'x', 'y');
        System.out.printf("%s %S%n", true, false);
        System.out.printf("%c%n", 'A' + 25);
        System.out.printf("Baris 1%nBaris 2%n");
        System.out.format("format() sama dengan printf(): %d%n", 7);
        System.out.print(String.format("%c=%d%n", 'Z', (int) 'Z'));
        System.out.printf("%S%n", kosong);
        System.out.printf("%5b|%-6B|%n", false, true);
    }
}
