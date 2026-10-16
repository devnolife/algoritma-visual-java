// Overflow int pada faktorial dan perkalian besar dibanding long
public class Main {
    public static void main(String[] args) {
        int faktorialInt = 1;
        long faktorialLong = 1;
        for (int i = 1; i <= 21; i++) {
            faktorialInt *= i;
            faktorialLong *= i;
            System.out.println(i + "! = " + faktorialInt + " (int), " + faktorialLong + " (long)");
        }
        int a = 50000;
        int b = 50000;
        System.out.println("50000 * 50000 (int)   = " + (a * b));
        System.out.println("50000 * 50000 (long)  = " + ((long) a * b));
        System.out.println("Dikonversi setelahnya = " + (long) (a * b));
        int detikPerTahun = 365 * 24 * 60 * 60;
        System.out.println("Detik per tahun: " + detikPerTahun);
        System.out.println("Milidetik per tahun (int) : " + detikPerTahun * 1000);
        System.out.println("Milidetik per tahun (long): " + detikPerTahun * 1000L);
    }
}
