// ArithmeticException: pembagian long dengan nol (double tidak error, long error)
public class Main {
    public static void main(String[] args) {
        long jarak = 9_000_000_000L;
        long waktu = 3;
        long sisa = jarak % waktu;
        System.out.println("Sisa bagi = " + sisa);
        System.out.println("Kecepatan = " + jarak / waktu);
        waktu -= 3;
        System.out.println("waktu sekarang " + waktu);
        double kecepatanDouble = jarak / (double) waktu;
        System.out.println("Pembagian double tidak error: " + kecepatanDouble);
        long kecepatan = jarak / waktu;
        System.out.println("tidak tercetak " + kecepatan);
    }
}
