// Compound assignment dengan cast implisit: += 3.7 pada int, byte, short, char, String
public class Main {
    public static void main(String[] args) {
        int x = 10;
        x += 3.7;
        System.out.println("int 10 += 3.7      -> " + x);
        x -= 0.5;
        System.out.println("lalu -= 0.5        -> " + x);
        x *= 1.5;
        System.out.println("lalu *= 1.5        -> " + x);
        x /= 0.3;
        System.out.println("lalu /= 0.3        -> " + x);
        x %= 7;
        System.out.println("lalu %= 7          -> " + x);
        byte b = 120;
        b += 10;
        System.out.println("byte 120 += 10     -> " + b);
        b -= 300;
        System.out.println("lalu -= 300        -> " + b);
        short s = 1000;
        s *= 1000;
        System.out.println("short 1000 *= 1000 -> " + s);
        char c = 'a';
        c += 2;
        System.out.println("char 'a' += 2      -> " + c);
        c += 1.5;
        System.out.println("lalu += 1.5        -> " + c);
        long l = 5;
        l += 2.9f;
        System.out.println("long 5 += 2.9f     -> " + l);
        int geser = 5;
        geser <<= 33;
        System.out.println("5 <<= 33           -> " + geser);
        geser >>= 1;
        geser ^= 0xFF;
        geser |= 0x100;
        geser &= 0x1F0;
        System.out.println("operasi bit beruntun -> " + geser);
        double d = 5;
        d /= 2;
        System.out.println("double 5 /= 2      -> " + d);
        int bagi = 7;
        bagi /= 2;
        System.out.println("int 7 /= 2         -> " + bagi);
        int besar = Integer.MAX_VALUE;
        besar += 1.0;
        System.out.println("MAX += 1.0         -> " + besar);
        String teks = "a";
        teks += 1 + 2;
        System.out.println("teks += 1 + 2      -> " + teks);
        teks += 'b' + 'c';
        System.out.println("teks += 'b' + 'c'  -> " + teks);
        teks += 'd';
        teks += 1.5;
        teks += true;
        System.out.println("tambahan lain      -> " + teks);
    }
}
