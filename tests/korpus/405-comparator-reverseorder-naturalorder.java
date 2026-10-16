import java.util.*;

public class Main {
    static class Skor implements Comparable<Skor> {
        String nama;
        int nilai;

        Skor(String nama, int nilai) {
            this.nama = nama;
            this.nilai = nilai;
        }

        @Override
        public int compareTo(Skor o) {
            System.out.println("  " + nama + ".compareTo(" + o.nama + ")");
            return Integer.compare(nilai, o.nilai);
        }

        @Override
        public String toString() {
            return nama + "=" + nilai;
        }
    }

    public static void main(String[] args) {
        List<Integer> angka = new ArrayList<>(List.of(5, 1, 4, 2, 3));
        Collections.sort(angka, Collections.reverseOrder());
        System.out.println("reverseOrder: " + angka);
        angka.sort(Comparator.naturalOrder());
        System.out.println("naturalOrder: " + angka);
        angka.sort(Comparator.reverseOrder());
        System.out.println("Comparator.reverseOrder: " + angka);

        PriorityQueue<Integer> maks = new PriorityQueue<>(Collections.reverseOrder());
        for (int x : new int[] {3, 9, 1, 7}) {
            maks.offer(x);
        }
        System.out.println("pq: " + maks + " peek " + maks.peek());
        StringBuilder keluar = new StringBuilder();
        while (!maks.isEmpty()) {
            keluar.append(maks.poll()).append(' ');
        }
        System.out.println("poll: " + keluar.toString().trim());

        List<Skor> daftar = new ArrayList<>();
        daftar.add(new Skor("Ani", 70));
        daftar.add(new Skor("Budi", 90));
        daftar.add(new Skor("Cici", 80));
        System.out.println("sort reverseOrder:");
        daftar.sort(Collections.reverseOrder());
        System.out.println(daftar);
        System.out.println("sort naturalOrder:");
        daftar.sort(Comparator.naturalOrder());
        System.out.println(daftar);

        Comparator<Integer> alami = Comparator.naturalOrder();
        Comparator<Integer> balik = Collections.reverseOrder();
        Comparator<Integer> balikLagi = Collections.reverseOrder();
        System.out.println("tunggal: " + (balikLagi == balik) + " " + (alami.reversed() == balik) + " " + (balik.reversed() == alami));
        System.out.println("compare: " + alami.compare(1, 2) + " " + balik.compare(1, 2));

        TreeSet<String> kata = new TreeSet<>(Collections.reverseOrder());
        kata.addAll(List.of("kiwi", "apel", "mangga"));
        System.out.println("treeset: " + kata + " first " + kata.first());

        Integer[] arr = {4, 8, 1, 6};
        Arrays.sort(arr, Collections.reverseOrder());
        System.out.println("array: " + Arrays.toString(arr));

        PriorityQueue<String> pqKata = new PriorityQueue<>(Comparator.reverseOrder());
        pqKata.addAll(List.of("b", "c", "a"));
        System.out.println("pq Comparator.reverseOrder: " + pqKata.poll() + " " + pqKata);
        TreeSet<Integer> ts = new TreeSet<>(Comparator.naturalOrder());
        ts.addAll(List.of(3, 1, 2));
        System.out.println("treeset naturalOrder: " + ts);
        Collections.sort(angka, Comparator.naturalOrder());
        System.out.println("Collections.sort naturalOrder: " + angka);
        try {
            List<Integer> berisiNull = new ArrayList<>(Arrays.asList(2, null, 1));
            berisiNull.sort(Collections.reverseOrder());
        } catch (NullPointerException e) {
            System.out.println("NPE: " + e.getMessage());
        }
    }
}
