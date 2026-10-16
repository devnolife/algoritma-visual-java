// Menara Hanoi: cetak langkah untuk 3 cakram dan hitung langkah untuk 1..8 cakram
public class Main {
    static int jumlahLangkah = 0;

    static void hanoi(int n, char asal, char tujuan, char bantu) {
        if (n == 0) {
            return;
        }
        hanoi(n - 1, asal, bantu, tujuan);
        jumlahLangkah++;
        System.out.println("Langkah " + jumlahLangkah + ": cakram " + n + " dari " + asal + " ke " + tujuan);
        hanoi(n - 1, bantu, tujuan, asal);
    }

    static long hitung(int n) {
        if (n == 0) {
            return 0;
        }
        return 2 * hitung(n - 1) + 1;
    }

    public static void main(String[] args) {
        hanoi(3, 'A', 'C', 'B');
        System.out.println("Total langkah untuk 3 cakram: " + jumlahLangkah);
        for (int n = 1; n <= 8; n++) {
            System.out.println(n + " cakram -> " + hitung(n) + " langkah");
        }
        System.out.println("64 cakram -> " + hitung(64) + " (long meluap jadi -1)");
    }
}
