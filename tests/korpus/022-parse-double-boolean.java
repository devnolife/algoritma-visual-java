// Double dan Boolean: parseDouble, isNaN, isInfinite, compare, parseBoolean
public class Main {
    public static void main(String[] args) {
        double a = Double.parseDouble("3.14");
        double b = Double.parseDouble("1e3");
        double c = Double.parseDouble("  2.5  ");
        double d = Double.parseDouble("-0");
        double e = Double.valueOf("7");
        System.out.println("parseDouble: " + a + " " + b + " " + c + " " + d + " " + e);
        System.out.println("Double.toString(100.0) = " + Double.toString(100.0));
        System.out.println("Double.toString(1e-4)  = " + Double.toString(1e-4));
        double nol = 0.0;
        double nan = nol / nol;
        double inf = 1 / nol;
        System.out.println("isNaN(0/0)         = " + Double.isNaN(nan));
        System.out.println("isInfinite(1/0)    = " + Double.isInfinite(inf));
        System.out.println("isInfinite(MAX)    = " + Double.isInfinite(Double.MAX_VALUE));
        System.out.println("isNaN(inf - inf)   = " + Double.isNaN(inf - inf));
        System.out.println("compare(0.0, -0.0) = " + Double.compare(0.0, -0.0));
        System.out.println("compare(NaN, 1.0)  = " + Double.compare(Double.NaN, 1.0));
        System.out.println("compare(1.5, 2.5)  = " + Double.compare(1.5, 2.5));
        System.out.println("0.0 == -0.0        = " + (0.0 == -0.0));
        System.out.println("MAX_VALUE = " + Double.MAX_VALUE);
        System.out.println("MIN_VALUE = " + Double.MIN_VALUE);
        System.out.println("POSITIVE_INFINITY = " + Double.POSITIVE_INFINITY);
        System.out.println("NEGATIVE_INFINITY = " + Double.NEGATIVE_INFINITY);
        System.out.println("NaN = " + Double.NaN);
        System.out.println("parseBoolean(\"true\")  = " + Boolean.parseBoolean("true"));
        System.out.println("parseBoolean(\"TRUE\")  = " + Boolean.parseBoolean("TRUE"));
        System.out.println("parseBoolean(\"ya\")    = " + Boolean.parseBoolean("ya"));
        System.out.println("parseBoolean(\" true\") = " + Boolean.parseBoolean(" true"));
        System.out.println("Boolean.toString(false) = " + Boolean.toString(false));
        String teks = Boolean.toString(3 > 2) + "!";
        System.out.println(teks);
        double total = Double.parseDouble("19.99") * 3;
        System.out.println("Total belanja = " + total);
        System.out.println("parseDouble(\"1.\") = " + Double.parseDouble("1.") + ", parseDouble(\".5\") = " + Double.parseDouble(".5"));
    }
}
