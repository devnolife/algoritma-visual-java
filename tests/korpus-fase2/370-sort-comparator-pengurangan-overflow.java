// Comparator berbasis pengurangan (a - b) salah untuk nilai ekstrem karena overflow; Integer.compare selalu benar
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        int[] isi = {5, Integer.MIN_VALUE, 100, -7, Integer.MAX_VALUE, 0, -2000000000, 2000000000};
        ArrayList<Integer> a = new ArrayList<>();
        ArrayList<Integer> b = new ArrayList<>();
        for (int x : isi) {
            a.add(x);
            b.add(x);
        }
        a.sort((x, y) -> x - y);
        b.sort((x, y) -> Integer.compare(x, y));
        System.out.println("pengurangan    : " + a);
        System.out.println("Integer.compare: " + b);
        System.out.println("MIN_VALUE - 5 = " + (Integer.MIN_VALUE - 5) + " (positif, jadi MIN dianggap lebih besar dari 5)");
        System.out.println("2000000000 - (-2000000000) = " + (2000000000 - (-2000000000)));
        ArrayList<Integer> c = new ArrayList<>(b);
        Collections.reverse(c);
        System.out.println("dibalik: " + c);
    }
}
