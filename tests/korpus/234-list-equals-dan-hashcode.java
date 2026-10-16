// List.equals membandingkan elemen sesuai urutan, lintas implementasi (ArrayList, LinkedList, List.of); hashCode list mengikuti isinya
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> a = new ArrayList<>(Arrays.asList("merah", "hijau", "biru"));
        LinkedList<String> b = new LinkedList<>();
        b.add("merah");
        b.add("hijau");
        b.add("biru");
        List<String> c = List.of("merah", "hijau", "biru");
        ArrayList<String> d = new ArrayList<>(Arrays.asList("biru", "hijau", "merah"));
        System.out.println("a.equals(b) = " + a.equals(b));
        System.out.println("b.equals(a) = " + b.equals(a));
        System.out.println("a.equals(c) = " + a.equals(c) + ", c.equals(a) = " + c.equals(a));
        System.out.println("a.equals(d) = " + a.equals(d));
        System.out.println("hashCode a = " + a.hashCode() + ", b = " + b.hashCode() + ", c = " + c.hashCode() + ", d = " + d.hashCode());
        ArrayList<Integer> x = new ArrayList<>();
        ArrayList<Integer> y = new ArrayList<>();
        System.out.println("dua list kosong sama? " + x.equals(y) + ", hashCode " + x.hashCode());
        x.add(1000);
        y.add(1000);
        System.out.println("berisi 1000: equals " + x.equals(y) + ", elemen == ? " + (x.get(0) == y.get(0)));
        x.add(null);
        y.add(null);
        System.out.println("dengan null: equals " + x.equals(y) + ", hashCode " + x.hashCode());
        y.set(1, 7);
        System.out.println("setelah y[1] = 7: " + x + " vs " + y + " -> " + x.equals(y));
    }
}
