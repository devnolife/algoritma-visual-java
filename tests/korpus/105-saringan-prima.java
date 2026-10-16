// Saringan Eratosthenes untuk bilangan prima sampai 100
public class Main {
    public static void main(String[] args) {
        int batas = 100;
        boolean[] bukanPrima = new boolean[batas + 1];
        bukanPrima[0] = true;
        bukanPrima[1] = true;
        for (int i = 2; i * i <= batas; i++) {
            if (!bukanPrima[i]) {
                for (int j = i * i; j <= batas; j += i) {
                    bukanPrima[j] = true;
                }
            }
        }
        int jumlah = 0;
        int total = 0;
        String baris = "";
        for (int i = 2; i <= batas; i++) {
            if (!bukanPrima[i]) {
                jumlah++;
                total += i;
                baris += String.format("%3d", i);
                if (jumlah % 10 == 0) {
                    System.out.println(baris);
                    baris = "";
                }
            }
        }
        if (!baris.isEmpty()) {
            System.out.println(baris);
        }
        System.out.println("Banyak prima <= " + batas + " : " + jumlah);
        System.out.println("Jumlah semua prima: " + total);
        int terbesar = batas;
        while (bukanPrima[terbesar]) {
            terbesar--;
        }
        System.out.println("Prima terbesar <= 100: " + terbesar);
    }
}
