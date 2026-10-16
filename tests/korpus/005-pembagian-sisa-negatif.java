// Pembagian dan sisa bagi dengan bilangan negatif, floorDiv, floorMod
public class Main {
    public static void main(String[] args) {
        int[] pembilang = {7, -7, 7, -7, 0, 1};
        int[] penyebut = {2, 2, -2, -2, 3, 5};
        for (int i = 0; i < pembilang.length; i++) {
            int p = pembilang[i];
            int q = penyebut[i];
            System.out.println(p + " / " + q + " = " + (p / q)
                    + ", " + p + " % " + q + " = " + (p % q)
                    + ", floorDiv = " + Math.floorDiv(p, q)
                    + ", floorMod = " + Math.floorMod(p, q));
        }
        System.out.println("-7.5 % 2   = " + (-7.5 % 2));
        System.out.println("7.5 % -2   = " + (7.5 % -2));
        System.out.println("5.0 % 0.3  = " + (5.0 % 0.3));
        System.out.println("-1 / 2     = " + (-1 / 2));
        System.out.println("-1 % 2     = " + (-1 % 2));
        System.out.println("-1.0 / 2   = " + (-1.0 / 2));
        int jam = -5;
        System.out.println("Jam (salah) : " + (jam % 24));
        System.out.println("Jam (benar) : " + Math.floorMod(jam, 24));
        long besar = -9_000_000_001L;
        System.out.println("long / 1000 = " + besar / 1000);
        System.out.println("long % 1000 = " + besar % 1000);
        System.out.println("floorMod long = " + Math.floorMod(besar, 1000L));
        System.out.println("floorDiv long = " + Math.floorDiv(besar, 1000L));
        System.out.println("1.0 / 0     = " + (1.0 / 0));
        System.out.println("-1.0 / 0    = " + (-1.0 / 0));
        System.out.println("0.0 / 0     = " + (0.0 / 0));
        System.out.println("5 % 0.0     = " + (5 % 0.0));
        System.out.println("-0.0 % 5    = " + (-0.0 % 5));
    }
}
