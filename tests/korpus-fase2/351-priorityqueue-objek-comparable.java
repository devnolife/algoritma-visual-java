// PriorityQueue berisi objek Comparable (pasien menurut tingkat darurat): urutan poll mengikuti compareTo, dan yang setara tidak dijamin FIFO
import java.util.PriorityQueue;

public class Main {
    static class Pasien implements Comparable<Pasien> {
        String nama;
        int darurat;
        int nomor;

        Pasien(String nama, int darurat, int nomor) {
            this.nama = nama;
            this.darurat = darurat;
            this.nomor = nomor;
        }

        @Override
        public int compareTo(Pasien lain) {
            return lain.darurat - darurat;
        }

        @Override
        public String toString() {
            return nama + "#" + nomor + "(" + darurat + ")";
        }
    }

    public static void main(String[] args) {
        PriorityQueue<Pasien> igd = new PriorityQueue<>();
        String[] nama = {"Ani", "Budi", "Cici", "Dodi", "Eka", "Fani", "Gani"};
        int[] tingkat = {2, 5, 2, 3, 5, 1, 2};
        for (int i = 0; i < nama.length; i++) {
            igd.offer(new Pasien(nama[i], tingkat[i], i + 1));
            System.out.println("datang " + nama[i] + " -> " + igd);
        }
        while (!igd.isEmpty()) {
            System.out.println("tangani " + igd.poll());
        }
    }
}
