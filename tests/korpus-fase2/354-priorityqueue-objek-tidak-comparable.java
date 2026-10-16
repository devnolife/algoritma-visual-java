// Menambahkan objek yang tidak Comparable ke PriorityQueue tanpa Comparator melempar ClassCastException, bahkan untuk elemen pertama
import java.util.PriorityQueue;

public class Main {
    static class Tugas {
        String nama;
        int prioritas;

        Tugas(String nama, int prioritas) {
            this.nama = nama;
            this.prioritas = prioritas;
        }
    }

    public static void main(String[] args) {
        PriorityQueue<Tugas> pakaiComparator = new PriorityQueue<>((a, b) -> a.prioritas - b.prioritas);
        pakaiComparator.add(new Tugas("laporan", 2));
        pakaiComparator.add(new Tugas("rapat", 1));
        System.out.println("dengan comparator: " + pakaiComparator.poll().nama + " lebih dulu");
        PriorityQueue<Tugas> tanpaComparator = new PriorityQueue<>();
        System.out.println("antrian tanpa comparator dibuat, size " + tanpaComparator.size());
        tanpaComparator.add(new Tugas("presentasi", 3));
        System.out.println("tidak tercetak");
    }
}
