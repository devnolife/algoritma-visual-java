// Kasus tepi substring, indexOf, lastIndexOf, contains, startsWith, charAt
public class Main {
    public static void main(String[] args) {
        String s = "algoritma dan pemrograman";
        System.out.println("panjang            = " + s.length());
        System.out.println("substring(0, 0)    = [" + s.substring(0, 0) + "]");
        System.out.println("substring(len)     = [" + s.substring(s.length()) + "]");
        System.out.println("substring(10)      = [" + s.substring(10) + "]");
        System.out.println("substring(4, 9)    = [" + s.substring(4, 9) + "]");
        System.out.println("indexOf('a')       = " + s.indexOf('a'));
        System.out.println("indexOf(\"dan\")     = " + s.indexOf("dan"));
        System.out.println("indexOf(\"java\")    = " + s.indexOf("java"));
        System.out.println("indexOf('a', 1)    = " + s.indexOf('a', 1));
        System.out.println("indexOf(\"r\", 100)  = " + s.indexOf("r", 100));
        System.out.println("indexOf(\"\")        = " + s.indexOf(""));
        System.out.println("lastIndexOf('a')   = " + s.lastIndexOf('a'));
        System.out.println("lastIndexOf(\"ram\") = " + s.lastIndexOf("ram"));
        System.out.println("lastIndexOf(\"\")    = " + s.lastIndexOf(""));
        System.out.println("lastIndexOf('a', 5)= " + s.lastIndexOf('a', 5));
        System.out.println("contains(\"\")       = " + s.contains(""));
        System.out.println("contains(\"gram\")   = " + s.contains("gram"));
        System.out.println("startsWith(\"\")     = " + s.startsWith(""));
        System.out.println("startsWith(\"algo\") = " + s.startsWith("algo"));
        System.out.println("endsWith(\"man\")    = " + s.endsWith("man"));
        System.out.println("charAt(len - 1)    = " + s.charAt(s.length() - 1));
        System.out.println("indexOf(97)        = " + s.indexOf(97));
        int posisi = s.indexOf(' ');
        String kataPertama = s.substring(0, posisi);
        String sisa = s.substring(posisi + 1);
        System.out.println("kata pertama = " + kataPertama + ", sisa = " + sisa);
        int hitung = 0;
        int dari = s.indexOf("a");
        while (dari != -1) {
            hitung++;
            dari = s.indexOf("a", dari + 1);
        }
        System.out.println("Jumlah huruf a = " + hitung);
        String email = "mahasiswa@kampus.ac.id";
        String pengguna = email.substring(0, email.indexOf('@'));
        String domain = email.substring(email.indexOf('@') + 1);
        System.out.println("Pengguna: " + pengguna + ", domain: " + domain);
        System.out.println("Ekstensi: " + email.substring(email.lastIndexOf('.') + 1));
        System.out.println("Tanpa titik: " + email.indexOf('#') + " " + email.lastIndexOf("xyz"));
    }
}
