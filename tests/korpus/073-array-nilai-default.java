// Nilai default elemen array: int, long, double, float, boolean, char, String
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = new int[3];
        long[] b = new long[2];
        double[] c = new double[3];
        float[] d = new float[2];
        boolean[] e = new boolean[3];
        char[] f = new char[3];
        String[] g = new String[3];
        byte[] h = new byte[2];
        short[] s = new short[2];
        System.out.println("int[]     : " + Arrays.toString(a));
        System.out.println("long[]    : " + Arrays.toString(b));
        System.out.println("double[]  : " + Arrays.toString(c));
        System.out.println("float[]   : " + Arrays.toString(d));
        System.out.println("boolean[] : " + Arrays.toString(e));
        System.out.println("String[]  : " + Arrays.toString(g));
        System.out.println("byte[]    : " + Arrays.toString(h));
        System.out.println("short[]   : " + Arrays.toString(s));
        System.out.println("char[0] sebagai int: " + (int) f[0]);
        System.out.println("char[0] == '\\u0000': " + (f[0] == '\u0000'));
        System.out.println("g[1] == null: " + (g[1] == null));
        System.out.println("g[1] + \"!\" = " + g[1] + "!");
        int[][] m = new int[2][3];
        System.out.println("int[2][3] : " + Arrays.deepToString(m));
        String[][] t = new String[2][2];
        System.out.println("String[2][2] : " + Arrays.deepToString(t));
        int[] kosong = new int[0];
        System.out.println("Panjang array kosong: " + kosong.length + " " + Arrays.toString(kosong));
        a[1] = 7;
        g[0] = "isi";
        e[2] = true;
        System.out.println(Arrays.toString(a) + " " + Arrays.toString(g) + " " + Arrays.toString(e));
        int jumlahNull = 0;
        for (String x : g) {
            if (x == null) {
                jumlahNull++;
            }
        }
        System.out.println("Elemen null tersisa: " + jumlahNull);
    }
}
