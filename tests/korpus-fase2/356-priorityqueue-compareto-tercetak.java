// compareTo yang mencetak argumennya memperlihatkan urutan perbandingan siftUp (offer) dan siftDown (poll) di dalam PriorityQueue
import java.util.PriorityQueue;

public class Main {
    static int jumlahBanding = 0;

    static class Angka implements Comparable<Angka> {
        int nilai;

        Angka(int nilai) {
            this.nilai = nilai;
        }

        @Override
        public int compareTo(Angka lain) {
            jumlahBanding++;
            System.out.print(nilai + "?" + lain.nilai + " ");
            return Integer.compare(nilai, lain.nilai);
        }

        @Override
        public String toString() {
            return String.valueOf(nilai);
        }
    }

    public static void main(String[] args) {
        PriorityQueue<Angka> pq = new PriorityQueue<>();
        int[] masuk = {50, 30, 70, 10, 40, 60, 20, 80, 5};
        for (int m : masuk) {
            System.out.print("offer " + m + ": ");
            pq.offer(new Angka(m));
            System.out.println("-> " + pq);
        }
        for (int i = 0; i < 4; i++) {
            System.out.print("poll: ");
            Angka a = pq.poll();
            System.out.println("-> keluar " + a + ", heap " + pq);
        }
        System.out.println("total perbandingan " + jumlahBanding);
    }
}
