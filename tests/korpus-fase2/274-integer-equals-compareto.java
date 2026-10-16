// Integer.equals, compareTo, Integer.compare, overflow pada Integer, dan equals antar wrapper berbeda (Integer vs Long) yang selalu false
public class Main {
    public static void main(String[] args) {
        Integer a = 42;
        Integer b = 7;
        System.out.println("a.compareTo(b) = " + a.compareTo(b));
        System.out.println("b.compareTo(a) = " + b.compareTo(a));
        System.out.println("a.compareTo(42) = " + a.compareTo(42));
        System.out.println("Integer.compare(3, 9) = " + Integer.compare(3, 9) + ", Integer.compare(9, 3) = " + Integer.compare(9, 3));
        System.out.println("a.equals(42) = " + a.equals(42));
        System.out.println("a.equals(42L) = " + a.equals(42L));
        Long panjang = 42L;
        System.out.println("panjang.equals(42) = " + panjang.equals(42));
        System.out.println("panjang == 42 (unboxing) = " + (panjang == 42));
        System.out.println("a.equals(\"42\") = " + a.equals("42"));
        Integer maks = Integer.MAX_VALUE;
        Integer lewat = maks + 1;
        System.out.println("MAX_VALUE + 1 = " + lewat + ", MIN_VALUE = " + Integer.MIN_VALUE);
        System.out.println("Integer.compare(MIN, 1) = " + Integer.compare(Integer.MIN_VALUE, 1) + ", tetapi MIN - 1 = " + (Integer.MIN_VALUE - 1));
        Integer x = Integer.valueOf("-15");
        int y = Integer.parseInt("15");
        System.out.println("x + y = " + (x + y) + ", x * y = " + (x * y));
        System.out.println("Integer.toString(255) + 1 = " + Integer.toString(255) + 1 + ", hashCode(255) = " + Integer.valueOf(255).hashCode());
        Integer[] data = {30, 10, 20};
        Integer terbesar = data[0];
        for (Integer d : data) {
            if (d.compareTo(terbesar) > 0) {
                terbesar = d;
            }
        }
        System.out.println("terbesar = " + terbesar + ", sum(terbesar, 1) = " + Integer.sum(terbesar, 1));
    }
}
