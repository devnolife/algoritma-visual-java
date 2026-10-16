// Aritmetika char: 'a' + 1, (char)('a' + 1), char++, dan selisih huruf
public class Main {
    public static void main(String[] args) {
        char c = 'a';
        System.out.println("'a' + 1        = " + ('a' + 1));
        System.out.println("(char)('a'+1)  = " + (char) ('a' + 1));
        System.out.println(c + 1);
        System.out.println((char) (c + 1));
        c++;
        System.out.println("Setelah c++    = " + c);
        c += 3;
        System.out.println("Setelah c += 3 = " + c);
        System.out.println("'z' - 'a'      = " + ('z' - 'a'));
        System.out.println("(int) 'A'      = " + (int) 'A');
        System.out.println("'0' + 5        = " + ('0' + 5));
        System.out.println("(char)('0'+5)  = " + (char) ('0' + 5));
        char digit = '7';
        int nilai = digit - '0';
        System.out.println("Nilai digit '7' = " + nilai);
        System.out.println("'a' + 'b'      = " + ('a' + 'b'));
        System.out.println('a' + 'b');
        System.out.println("" + 'a' + 'b');
        char besar = (char) (c - 32);
        System.out.println("Huruf besar dari " + c + " = " + besar);
        for (char h = 'A'; h <= 'E'; h++) {
            System.out.print(h);
            System.out.print(',');
        }
        System.out.println();
        char u = '\u0041';
        System.out.println("\\u0041 = " + u);
        char dariAngka = 66;
        System.out.println("char dari 66 = " + dariAngka);
        int kode = 'Z';
        System.out.println("int dari 'Z' = " + kode);
        System.out.println("Max char = " + (int) Character.MAX_VALUE);
        System.out.println("(char) 65601 = " + (char) 65601);
        char z = 'z';
        z++;
        System.out.println("'z' + 1 sebagai char = " + z);
        char nol = 0;
        nol--;
        System.out.println("char 0 dikurangi 1 = " + (int) nol);
        System.out.println("'A' < 'a' ? " + ('A' < 'a'));
        System.out.println("c == 'e' ? " + (c == 'e'));
        System.out.println("c == 101 ? " + (c == 101));
    }
}
