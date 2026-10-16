// Konversi basis manual: desimal ke biner/oktal/heksa dan sebaliknya
public class Main {
    static String keBasis(int n, int basis) {
        String digit = "0123456789ABCDEF";
        if (n == 0) {
            return "0";
        }
        String hasil = "";
        while (n > 0) {
            hasil = digit.charAt(n % basis) + hasil;
            n /= basis;
        }
        return hasil;
    }

    static int dariBasis(String s, int basis) {
        String digit = "0123456789ABCDEF";
        int hasil = 0;
        for (int i = 0; i < s.length(); i++) {
            hasil = hasil * basis + digit.indexOf(Character.toUpperCase(s.charAt(i)));
        }
        return hasil;
    }

    static String biner(int n) {
        if (n < 2) {
            return "" + n;
        }
        return biner(n / 2) + n % 2;
    }

    public static void main(String[] args) {
        int[] data = {0, 5, 10, 255, 1000, 2024};
        for (int x : data) {
            System.out.println(x + " -> biner " + keBasis(x, 2) + ", oktal " + keBasis(x, 8)
                    + ", heksa " + keBasis(x, 16) + ", rekursif " + biner(x));
            System.out.println("   cek: " + keBasis(x, 2).equals(Integer.toBinaryString(x))
                    + " " + keBasis(x, 16).equalsIgnoreCase(Integer.toHexString(x)));
        }
        System.out.println("1011 (biner) = " + dariBasis("1011", 2));
        System.out.println("777 (oktal)  = " + dariBasis("777", 8));
        System.out.println("ff (heksa)   = " + dariBasis("ff", 16));
        System.out.println("7E8 (heksa)  = " + dariBasis("7E8", 16));
    }
}
