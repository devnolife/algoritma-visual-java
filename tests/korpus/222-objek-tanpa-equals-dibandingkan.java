// Tanpa override equals, dua objek berisi sama dianggap berbeda: equals bawaan Object sama dengan ==
import java.util.ArrayList;

public class Main {
    static class Koordinat {
        int x;
        int y;

        Koordinat(int x, int y) {
            this.x = x;
            this.y = y;
        }

        boolean samaDengan(Koordinat lain) {
            return lain != null && x == lain.x && y == lain.y;
        }
    }

    public static void main(String[] args) {
        Koordinat a = new Koordinat(3, 4);
        Koordinat b = new Koordinat(3, 4);
        Koordinat c = a;
        System.out.println("a == b       : " + (a == b));
        System.out.println("a.equals(b)  : " + a.equals(b));
        System.out.println("a.equals(c)  : " + a.equals(c));
        System.out.println("a.samaDengan(b): " + a.samaDengan(b));
        System.out.println("a.equals(null): " + a.equals(null));
        ArrayList<Koordinat> jejak = new ArrayList<>();
        jejak.add(a);
        jejak.add(new Koordinat(5, 6));
        System.out.println("contains(a) = " + jejak.contains(a));
        System.out.println("contains(b) = " + jejak.contains(b));
        System.out.println("indexOf(b) = " + jejak.indexOf(b));
        System.out.println("remove(b) = " + jejak.remove(b) + ", size = " + jejak.size());
        int ditemukan = -1;
        for (int i = 0; i < jejak.size(); i++) {
            if (jejak.get(i).samaDengan(b)) {
                ditemukan = i;
            }
        }
        System.out.println("cari manual dengan samaDengan: indeks " + ditemukan);
        String s1 = "ab";
        String s2 = new String("ab");
        System.out.println("String: s1 == s2 " + (s1 == s2) + ", s1.equals(s2) " + s1.equals(s2));
    }
}
