// Segitiga Floyd dan pola angka dengan printf lebar tetap
public class Main {
    public static void main(String[] args) {
        int angka = 1;
        for (int i = 1; i <= 5; i++) {
            for (int j = 1; j <= i; j++) {
                System.out.printf("%3d", angka);
                angka++;
            }
            System.out.println();
        }
        System.out.println();
        for (int i = 1; i <= 4; i++) {
            for (int j = 1; j <= 4 - i; j++) {
                System.out.print(" ");
            }
            for (int j = 1; j <= i; j++) {
                System.out.print(j);
            }
            for (int j = i - 1; j >= 1; j--) {
                System.out.print(j);
            }
            System.out.println();
        }
        System.out.println();
        for (int i = 1; i <= 4; i++) {
            for (int j = 1; j <= 4; j++) {
                System.out.print((i + j) % 2 == 0 ? "1 " : "0 ");
            }
            System.out.println();
        }
        System.out.println();
        char huruf = 'A';
        for (int i = 1; i <= 4; i++) {
            String baris = "";
            for (int j = 0; j < i; j++) {
                baris += huruf;
                huruf++;
            }
            System.out.println(baris);
        }
    }
}
