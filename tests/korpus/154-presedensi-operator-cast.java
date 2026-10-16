// Presedensi operator dan cast: (char) 97 + 1, (int) 3.7 + 0.5, a+++b, a - - - b, << vs +
public class Main {
    public static void main(String[] args) {
        System.out.println((char) 97 + 1);
        System.out.println((char) (97 + 1));
        System.out.println((int) 3.7 + 0.5);
        System.out.println((int) (3.7 + 0.5));
        System.out.println(-(int) 2.5);
        System.out.println((int) -2.5);
        System.out.println((double) 1 / 3);
        System.out.println((double) (1 / 3));
        System.out.println((long) 1e10 * 2);
        System.out.println((int) 'a' + 'b');
        System.out.println((char) 'a' + 'b');
        System.out.println("" + (char) 65 + (char) 66);
        int x = 7;
        System.out.println(-x / 2 + " " + -(x / 2) + " " + (-x) % 3);
        System.out.println(~x + 1);
        System.out.println(!(x > 5) || x == 7);
        System.out.println(x > 5 == true);
        System.out.println(1 + 2 * 3 - 4 / 2 % 3);
        System.out.println(10 - 4 - 3);
        System.out.println(100 / 10 / 5);
        System.out.println(2 * 3 % 4);
        System.out.println(1 << 2 + 3);
        System.out.println((1 << 2) + 3);
        System.out.println(5 & 3 + 1);
        System.out.println(5 | 2 ^ 3 & 1);
        System.out.println(5 > 3 == 2 > 1);
        System.out.println(true || false && false);
        System.out.println(x++ + -x);
        int a = 3, b = 4;
        System.out.println(a+++b);
        System.out.println(a + " " + b);
        System.out.println(a - -b);
        System.out.println(a - - - b);
        System.out.println(- -a);
        System.out.println(a-- - --b);
        System.out.println(a + " " + b);
        int c = 2;
        c *= 3 + 4;
        System.out.println("c *= 3 + 4 -> " + c);
        boolean p = false;
        p |= 3 > 2 && !p;
        System.out.println("p = " + p);
        System.out.println(1 + 2 + "3" + 4 * 5);
        System.out.println(10 == 10.0);
        System.out.println('a' == 97);
        System.out.println(0.5 == 0.5f);
        System.out.println(0.1 == 0.1f);
    }
}
