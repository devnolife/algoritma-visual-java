// Trigonometri: sin, cos, tan, toRadians, toDegrees, atan2, PI dan E
public class Main {
    public static void main(String[] args) {
        System.out.println("PI = " + Math.PI);
        System.out.println("E  = " + Math.E);
        int[] sudut = {0, 30, 45, 60, 90, 180};
        for (int s : sudut) {
            double rad = Math.toRadians(s);
            System.out.println(s + " derajat = " + rad + " rad, sin = " + Math.sin(rad)
                    + ", cos = " + Math.cos(rad));
        }
        System.out.println("tan(45 derajat) = " + Math.tan(Math.toRadians(45)));
        System.out.println("sin(PI)       = " + Math.sin(Math.PI));
        System.out.println("cos(PI / 2)   = " + Math.cos(Math.PI / 2));
        System.out.println("cos(0)        = " + Math.cos(0));
        System.out.println("toDegrees(PI) = " + Math.toDegrees(Math.PI));
        System.out.println("toDegrees(1)  = " + Math.toDegrees(1));
        System.out.println("atan2(1, 1)   = " + Math.atan2(1, 1));
        System.out.println("atan2(-1, -1) = " + Math.atan2(-1, -1));
        System.out.println("atan2(0, -1)  = " + Math.atan2(0, -1));
        double sudutDerajat = Math.toDegrees(Math.atan2(3, 4));
        System.out.printf("Sudut segitiga 3-4-5 = %.4f derajat%n", sudutDerajat);
        double jariJari = 7;
        System.out.println("Keliling lingkaran r=7 = " + 2 * Math.PI * jariJari);
        System.out.println("Luas lingkaran r=7     = " + Math.PI * jariJari * jariJari);
        System.out.printf("Luas dibulatkan        = %.2f%n", Math.PI * jariJari * jariJari);
        double tinggi = 10 * Math.sin(Math.toRadians(30));
        System.out.printf("Tinggi tangga 10 m pada 30 derajat = %.3f m%n", tinggi);
    }
}
