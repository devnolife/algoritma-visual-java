// compareTo mencetak argumennya saat Collections.sort mengurutkan 5 elemen: urutan perbandingan countRun + insertion sort biner milik JDK
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    static int n = 0;

    static class Kartu implements Comparable<Kartu> {
        int nilai;

        Kartu(int nilai) {
            this.nilai = nilai;
        }

        @Override
        public int compareTo(Kartu lain) {
            n++;
            System.out.println("  banding " + nilai + " dengan " + lain.nilai);
            return nilai - lain.nilai;
        }

        @Override
        public String toString() {
            return "" + nilai;
        }
    }

    public static void main(String[] args) {
        int[][] data = {{3, 1, 4, 1, 5}, {1, 2, 3, 4, 5}, {5, 4, 3, 2, 1}, {2, 2, 2, 1, 1}};
        for (int[] d : data) {
            ArrayList<Kartu> kartu = new ArrayList<>();
            for (int x : d) {
                kartu.add(new Kartu(x));
            }
            n = 0;
            System.out.println("urutkan " + kartu + ":");
            Collections.sort(kartu);
            System.out.println("hasil " + kartu + " dengan " + n + " perbandingan");
        }
    }
}
