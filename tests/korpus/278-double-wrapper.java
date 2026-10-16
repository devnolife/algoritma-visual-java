// Wrapper Double: equals vs ==, 0.0 dan -0.0, NaN, compareTo, Double.compare, parse, dan penjumlahan ArrayList<Double>
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        Double a = 0.1 + 0.2;
        Double b = 0.3;
        System.out.println("0.1 + 0.2 = " + a + ", equals 0.3? " + a.equals(b) + ", compareTo = " + a.compareTo(b));
        Double nol = 0.0;
        Double negNol = -0.0;
        System.out.println("0.0 == -0.0 (primitif) : " + (0.0 == -0.0));
        System.out.println("Double 0.0 equals -0.0 : " + nol.equals(negNol) + ", compare = " + Double.compare(0.0, -0.0));
        Double nan = Double.NaN;
        System.out.println("NaN == NaN (primitif) : " + (Double.NaN == Double.NaN) + ", Double NaN equals NaN : " + nan.equals(Double.NaN));
        System.out.println("compare(NaN, 1e308) = " + Double.compare(Double.NaN, 1e308) + ", isNaN = " + nan.isNaN());
        Double x = 2.5;
        Double y = 2.5;
        System.out.println("x == y (objek) : " + (x == y) + ", x.equals(y) : " + x.equals(y) + ", x.doubleValue() == y : " + (x.doubleValue() == y));
        System.out.println("Double.valueOf(\"3.75\") = " + Double.valueOf("3.75") + ", parseDouble(\"1e-3\") = " + Double.parseDouble("1e-3"));
        System.out.println("intValue(9.99) = " + Double.valueOf(9.99).intValue() + ", MAX = " + Double.MAX_VALUE + ", MIN = " + Double.MIN_VALUE);
        ArrayList<Double> berat = new ArrayList<>();
        berat.add(1.5);
        berat.add(2.25);
        berat.add(0.1);
        berat.add(3.0);
        double total = 0;
        for (double w : berat) {
            total += w;
        }
        System.out.println("berat " + berat + ", total " + total + ", rata " + total / berat.size());
        System.out.println("contains(2.25) " + berat.contains(2.25) + ", indexOf(3.0) " + berat.indexOf(3.0) + ", indexOf((double) 3) " + berat.indexOf((double) 3));
        Double dibagi = 1.0 / 0;
        System.out.println("1.0/0 = " + dibagi + ", isInfinite = " + dibagi.isInfinite() + ", hashCode(1.5) = " + Double.valueOf(1.5).hashCode());
    }
}
