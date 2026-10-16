// Aliasing array: dua variabel menunjuk array yang sama, == vs Arrays.equals
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = {10, 20, 30};
        int[] b = a;
        b[0] = 99;
        System.out.println("a = " + Arrays.toString(a) + ", b = " + Arrays.toString(b));
        System.out.println("a == b : " + (a == b));
        int[] c = Arrays.copyOf(a, a.length);
        c[1] = -1;
        System.out.println("a = " + Arrays.toString(a) + ", c = " + Arrays.toString(c));
        System.out.println("a == c : " + (a == c) + ", equals: " + Arrays.equals(a, c));
        c[1] = 20;
        System.out.println("setelah dipulihkan, equals: " + Arrays.equals(a, c));
        int[] d = new int[a.length];
        for (int i = 0; i < a.length; i++) {
            d[i] = a[i];
        }
        a[2] = 0;
        System.out.println("salinan manual tidak ikut berubah: " + Arrays.toString(d));
        b = new int[] {1};
        System.out.println("b diganti, a tetap: " + Arrays.toString(a) + " / " + Arrays.toString(b));
        String[] s1 = {"x", "y"};
        String[] s2 = s1;
        s2[1] = "z";
        System.out.println("s1 = " + Arrays.toString(s1));
        int[][] m = {{1, 2}, {3, 4}};
        int[][] n = {m[0], m[1]};
        n[0][0] = 100;
        System.out.println("salinan dangkal 2D ikut berubah: " + Arrays.deepToString(m));
        int[] x = {5};
        int[] y = x;
        x = null;
        System.out.println("y masih memegang array: " + Arrays.toString(y) + ", x = " + x);
    }
}
