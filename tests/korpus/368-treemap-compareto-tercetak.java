// compareTo yang mencetak argumennya saat TreeMap disisipi: kunci pertama dibandingkan dengan dirinya sendiri, lalu tiap put/get/remove menelusuri dari akar
import java.util.TreeMap;

public class Main {
    static class Kode implements Comparable<Kode> {
        String s;

        Kode(String s) {
            this.s = s;
        }

        @Override
        public int compareTo(Kode o) {
            System.out.print(s + "?" + o.s + " ");
            return s.compareTo(o.s);
        }

        @Override
        public String toString() {
            return s;
        }
    }

    public static void main(String[] args) {
        TreeMap<Kode, Integer> pohon = new TreeMap<>();
        String[] kunci = {"M", "D", "S", "B", "F", "Q", "W", "A", "E"};
        for (int i = 0; i < kunci.length; i++) {
            System.out.print("put " + kunci[i] + ": ");
            pohon.put(new Kode(kunci[i]), i);
            System.out.println();
        }
        System.out.println("isi " + pohon);
        System.out.print("get F: ");
        System.out.println("-> " + pohon.get(new Kode("F")));
        System.out.print("containsKey Z: ");
        System.out.println("-> " + pohon.containsKey(new Kode("Z")));
        System.out.print("put D lagi: ");
        pohon.put(new Kode("D"), 99);
        System.out.println();
        System.out.print("remove S: ");
        pohon.remove(new Kode("S"));
        System.out.println("-> " + pohon);
    }
}
