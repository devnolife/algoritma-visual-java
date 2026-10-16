// Resolusi overload: int vs long vs double vs String vs varargs, pelebaran char/byte/short/float
public class Main {
    static String cetak(int x) { return "int " + x; }
    static String cetak(long x) { return "long " + x; }
    static String cetak(double x) { return "double " + x; }
    static String cetak(String x) { return "String " + x; }
    static String cetak(int... xs) { return "varargs panjang " + xs.length; }

    static String jumlah(int a, int b) { return "int,int"; }
    static String jumlah(long a, long b) { return "long,long"; }
    static String jumlah(double a, double b) { return "double,double"; }

    static String tipe(char c) { return "char"; }
    static String tipe(int i) { return "int"; }

    static String campur(int a, double b) { return "int,double"; }
    static String campur(double a, int b) { return "double,int"; }

    public static void main(String[] args) {
        byte b = 1;
        short s = 2;
        char c = 'A';
        long l = 3;
        float f = 4.5f;
        System.out.println(cetak(5));
        System.out.println(cetak(b));
        System.out.println(cetak(s));
        System.out.println(cetak(c));
        System.out.println(cetak(l));
        System.out.println(cetak(f));
        System.out.println(cetak(5L));
        System.out.println(cetak(2.0));
        System.out.println(cetak("hai"));
        System.out.println(cetak());
        System.out.println(cetak(1, 2));
        System.out.println(jumlah(1, 2));
        System.out.println(jumlah(1, 2L));
        System.out.println(jumlah(1, 2.0f));
        System.out.println(jumlah('a', 'b'));
        System.out.println(jumlah(b, s));
        System.out.println(tipe('x'));
        System.out.println(tipe('x' + 1));
        System.out.println(tipe((char) ('x' + 1)));
        System.out.println(campur(1, 2.0));
        System.out.println(campur(1.0, 2));
    }
}
