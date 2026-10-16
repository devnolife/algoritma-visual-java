// Math.abs, max, min dengan tipe campuran int, long, float, double dan kasus khusus
public class Main {
    public static void main(String[] args) {
        System.out.println("abs(-5)        = " + Math.abs(-5));
        System.out.println("abs(-5.5)      = " + Math.abs(-5.5));
        System.out.println("abs(-0.0)      = " + Math.abs(-0.0));
        System.out.println("abs(MIN int)   = " + Math.abs(Integer.MIN_VALUE));
        System.out.println("abs(-7L)       = " + Math.abs(-7L));
        System.out.println("abs(-2.5f)     = " + Math.abs(-2.5f));
        System.out.println("max(3, 7)      = " + Math.max(3, 7));
        System.out.println("max(3, 7L)     = " + Math.max(3, 7L));
        System.out.println("max(3, 7.0)    = " + Math.max(3, 7.0));
        System.out.println("max(3, 2.5f)   = " + Math.max(3, 2.5f));
        System.out.println("min(-0.0, 0.0) = " + Math.min(-0.0, 0.0));
        System.out.println("max(-0.0, 0.0) = " + Math.max(-0.0, 0.0));
        System.out.println("max(NaN, 1)    = " + Math.max(Double.NaN, 1));
        System.out.println("min('a', 'b')  = " + Math.min('a', 'b'));
        int[] nilai = {72, 85, 64, 91, 78};
        int tertinggi = Integer.MIN_VALUE;
        int terendah = Integer.MAX_VALUE;
        for (int n : nilai) {
            tertinggi = Math.max(tertinggi, n);
            terendah = Math.min(terendah, n);
        }
        System.out.println("Tertinggi = " + tertinggi + ", terendah = " + terendah);
        System.out.println("Selisih absolut 64 - 91 = " + Math.abs(64 - 91));
        int dibatasi = Math.max(0, Math.min(100, 135));
        System.out.println("Nilai dibatasi ke 0..100 = " + dibatasi);
        System.out.println("Integer.max/min = " + Integer.max(4, 9) + " " + Integer.min(4, 9));
        System.out.println("Integer.sum(MAX, 1) = " + Integer.sum(Integer.MAX_VALUE, 1));
        double jarak = Math.abs(-3.25) + Math.abs(1.75);
        System.out.println("Jarak total = " + jarak);
    }
}
