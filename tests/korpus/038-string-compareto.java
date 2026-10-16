// compareTo dan compareToIgnoreCase: nilai selisih karakter dan panjang, urutan sort
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        System.out.println("apel vs apel     : " + "apel".compareTo("apel"));
        System.out.println("apel vs anggur   : " + "apel".compareTo("anggur"));
        System.out.println("a vs ab          : " + "a".compareTo("ab"));
        System.out.println("abc vs a         : " + "abc".compareTo("a"));
        System.out.println("B vs a           : " + "B".compareTo("a"));
        System.out.println("a vs B           : " + "a".compareTo("B"));
        System.out.println("kosong vs xyz    : " + "".compareTo("xyz"));
        System.out.println("Zebra vs apel    : " + "Zebra".compareTo("apel"));
        System.out.println("ignoreCase Zebra/apel : " + "Zebra".compareToIgnoreCase("apel"));
        System.out.println("ignoreCase JAVA/java  : " + "JAVA".compareToIgnoreCase("java"));
        System.out.println("equalsIgnoreCase      : " + "JaVa".equalsIgnoreCase("jAvA"));
        System.out.println("10 vs 9          : " + "10".compareTo("9"));
        String[] buah = {"mangga", "Apel", "jeruk", "Durian", "apel", "belimbing"};
        Arrays.sort(buah);
        System.out.println("Urut (case-sensitive): " + Arrays.toString(buah));
        String terkecil = buah[buah.length - 1];
        for (String b : buah) {
            if (b.compareToIgnoreCase(terkecil) < 0) {
                terkecil = b;
            }
        }
        System.out.println("Terkecil tanpa peduli kapital: " + terkecil);
        String x = "kucing";
        String y = "kuda";
        int hasil = x.compareTo(y);
        if (hasil < 0) {
            System.out.println(x + " sebelum " + y + " (" + hasil + ")");
        } else if (hasil > 0) {
            System.out.println(x + " sesudah " + y + " (" + hasil + ")");
        } else {
            System.out.println("sama");
        }
    }
}
