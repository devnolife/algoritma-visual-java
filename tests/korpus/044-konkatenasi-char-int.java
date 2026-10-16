// Jebakan konkatenasi: 'a' + 'b' + "c" vs "c" + 'a' + 'b', angka, null, dan array null
public class Main {
    public static void main(String[] args) {
        System.out.println('a' + 'b' + "c");
        System.out.println("c" + 'a' + 'b');
        System.out.println("c" + ('a' + 'b'));
        System.out.println(1 + 2 + "3");
        System.out.println("1" + 2 + 3);
        System.out.println("1" + (2 + 3));
        System.out.println(1 + 2 + "3" + 4 + 5);
        System.out.println("" + 'a' + 1);
        System.out.println('a' + 1 + "");
        System.out.println((char) ('a' + 1) + "");
        System.out.println("x" + null);
        String s = null;
        System.out.println(s + "!");
        s += 5;
        System.out.println(s);
        System.out.println("1" + 1.0);
        System.out.println("" + 1.0f);
        System.out.println("" + 1e10);
        System.out.println("" + 100.0 / 3);
        System.out.println(true + "x");
        System.out.println("hasil: " + 10 / 4);
        System.out.println("hasil: " + 10 / 4.0);
        System.out.println("hasil: " + 10 + 4);
        System.out.println("hasil: " + (10 + 4));
        System.out.println(10 + 4 + " hasil");
        System.out.println("" + -5 + -3);
        System.out.println("" + 'A' + 'B' + ('C' + 1));
        char c = 'J';
        int n = 21;
        System.out.println(c + n);
        System.out.println(c + "" + n);
        System.out.println("long: " + 5L + ", short: " + (short) 7 + ", byte: " + (byte) -1);
        int[] kosong = null;
        System.out.println("array null: " + kosong);
        String t = "nilai";
        t = t + 1 + 1;
        System.out.println(t);
        t = 1 + 1 + t;
        System.out.println(t);
    }
}
