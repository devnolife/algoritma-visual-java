import java.util.*;

public class Main {
    public static void main(String[] args) {
        Set<String> a = new HashSet<>(List.of("apel", "jeruk", "mangga", "kiwi"));
        Set<String> b = new HashSet<>(List.of("kiwi", "melon", "apel"));
        Set<String> gabungan = new HashSet<>(a);
        gabungan.addAll(b);
        Set<String> irisan = new HashSet<>(a);
        boolean berubah1 = irisan.retainAll(b);
        Set<String> selisih = new HashSet<>(a);
        boolean berubah2 = selisih.removeAll(b);
        System.out.println("gabungan " + gabungan);
        System.out.println("irisan " + irisan + " " + berubah1);
        System.out.println("selisih " + selisih + " " + berubah2);
        System.out.println("containsAll " + a.containsAll(irisan) + " " + b.containsAll(a));
        System.out.println("retainAll tanpa perubahan " + irisan.retainAll(a));

        TreeSet<Integer> t = new TreeSet<>(List.of(5, 1, 9, 3, 7));
        System.out.println(t.removeAll(List.of(3, 9, 100)) + " treeset " + t);
        System.out.println(t.retainAll(new ArrayList<>(List.of(1, 7, 8))) + " treeset " + t);

        List<Integer> daftar = new ArrayList<>(List.of(4, 8, 15, 16, 23, 42, 8));
        System.out.println(daftar.removeAll(List.of(8, 23)) + " list " + daftar);
        System.out.println(daftar.retainAll(new HashSet<>(List.of(4, 16, 99))) + " list " + daftar);
        System.out.println(daftar.removeAll(List.of(77)) + " list " + daftar);

        LinkedList<String> ll = new LinkedList<>(List.of("a", "b", "c", "b"));
        System.out.println(ll.removeAll(List.of("b")) + " " + ll);
        System.out.println(ll.retainAll(List.of("x")) + " " + ll);

        Set<Integer> besar = new LinkedHashSet<>(List.of(1, 2, 3, 4, 5, 6));
        System.out.println(besar.removeAll(List.of(2, 4, 4)) + " linkedhashset " + besar);
        Set<Integer> kecil = new LinkedHashSet<>(List.of(10, 20));
        System.out.println(kecil.removeAll(List.of(20, 30, 40)) + " linkedhashset " + kecil);

        ArrayDeque<Integer> antre = new ArrayDeque<>(List.of(1, 2, 3));
        System.out.println("deque containsAll " + antre.containsAll(List.of(3, 1)));

        try {
            List.of(1, 2).removeAll(List.of(9));
        } catch (UnsupportedOperationException e) {
            System.out.println("List.of removeAll: " + e.getMessage());
        }
        try {
            Arrays.asList(1, 2, 3).removeAll(List.of(2));
        } catch (UnsupportedOperationException e) {
            System.out.println("Arrays.asList removeAll: " + e.getMessage());
        }
        System.out.println("Arrays.asList tanpa yang cocok: " + Arrays.asList(1, 2, 3).removeAll(List.of(9)));
        try {
            daftar.removeAll(null);
        } catch (NullPointerException e) {
            System.out.println("removeAll(null): " + e.getMessage());
        }
        try {
            a.containsAll(null);
        } catch (NullPointerException e) {
            System.out.println("containsAll(null): " + e.getMessage());
        }
    }
}
