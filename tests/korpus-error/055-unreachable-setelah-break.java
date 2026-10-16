// Error: pernyataan setelah break di dalam loop (unreachable statement)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int[] data = {5, 8, 13};
        for (int d : data) {
            if (d > 6) {
                System.out.println("ketemu " + d);
                break;
                System.out.println("tidak akan tercetak");
            }
        }
    }
}
