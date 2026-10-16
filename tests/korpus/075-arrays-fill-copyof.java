// Arrays.fill, copyOf (potong dan isi default), copyOfRange, dan Arrays.equals
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] a = new int[5];
        Arrays.fill(a, 7);
        System.out.println("fill 7      : " + Arrays.toString(a));
        char[] garis = new char[10];
        Arrays.fill(garis, '=');
        System.out.println("fill char   : " + new String(garis));
        String[] nama = new String[3];
        Arrays.fill(nama, "kosong");
        System.out.println("fill String : " + Arrays.toString(nama));
        int[] data = {1, 2, 3, 4, 5};
        int[] pendek = Arrays.copyOf(data, 3);
        int[] panjang = Arrays.copyOf(data, 8);
        System.out.println("copyOf 3    : " + Arrays.toString(pendek));
        System.out.println("copyOf 8    : " + Arrays.toString(panjang));
        String[] namaPanjang = Arrays.copyOf(new String[] {"a", "b"}, 4);
        System.out.println("copyOf str  : " + Arrays.toString(namaPanjang));
        double[] d = Arrays.copyOf(new double[] {1.5}, 3);
        System.out.println("copyOf dbl  : " + Arrays.toString(d));
        System.out.println("copyOfRange 1..4 : " + Arrays.toString(Arrays.copyOfRange(data, 1, 4)));
        System.out.println("copyOfRange 3..7 : " + Arrays.toString(Arrays.copyOfRange(data, 3, 7)));
        System.out.println("copyOfRange 2..2 : " + Arrays.toString(Arrays.copyOfRange(data, 2, 2)));
        int[] salinan = Arrays.copyOf(data, data.length);
        System.out.println("equals salinan : " + Arrays.equals(data, salinan));
        System.out.println("== salinan     : " + (data == salinan));
        salinan[0] = 99;
        System.out.println("setelah diubah : " + Arrays.equals(data, salinan) + ", asli " + Arrays.toString(data));
        System.out.println("equals beda panjang: " + Arrays.equals(data, pendek));
        boolean[] b1 = {true, false};
        boolean[] b2 = {true, false};
        System.out.println("equals boolean : " + Arrays.equals(b1, b2));
        String[] s1 = {"x", "y"};
        String[] s2 = {"x", new String(new char[] {'y'})};
        System.out.println("equals String  : " + Arrays.equals(s1, s2));
    }
}
