// Penjadwal tugas dengan PriorityQueue: prioritas tinggi dulu, bila sama yang datang lebih awal dulu (pemecah seri nomor urut di compareTo)
import java.util.PriorityQueue;

public class Main {
    static int urutan = 0;

    static class Tugas implements Comparable<Tugas> {
        String nama;
        int prioritas;
        int nomor;

        Tugas(String nama, int prioritas) {
            this.nama = nama;
            this.prioritas = prioritas;
            urutan++;
            this.nomor = urutan;
        }

        @Override
        public int compareTo(Tugas lain) {
            if (prioritas != lain.prioritas) {
                return Integer.compare(lain.prioritas, prioritas);
            }
            return Integer.compare(nomor, lain.nomor);
        }

        @Override
        public String toString() {
            return nama + "[p" + prioritas + ",#" + nomor + "]";
        }
    }

    public static void main(String[] args) {
        PriorityQueue<Tugas> antrian = new PriorityQueue<>();
        antrian.add(new Tugas("backup", 1));
        antrian.add(new Tugas("email", 2));
        antrian.add(new Tugas("deploy", 3));
        antrian.add(new Tugas("laporan", 2));
        System.out.println("antrian: " + antrian);
        int menit = 0;
        while (!antrian.isEmpty()) {
            Tugas t = antrian.poll();
            menit += 5;
            System.out.println("menit " + menit + ": kerjakan " + t);
            if (t.nama.equals("deploy")) {
                antrian.add(new Tugas("cek server", 3));
                antrian.add(new Tugas("catat log", 2));
                System.out.println("  tugas susulan masuk: " + antrian);
            }
        }
    }
}
