// Collections.sort dengan Comparable: Mahasiswa diurutkan menurut IPK menurun, lalu NIM menaik bila IPK sama; min/max memakai compareTo yang sama
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    static class Mahasiswa implements Comparable<Mahasiswa> {
        String nim;
        String nama;
        double ipk;

        Mahasiswa(String nim, String nama, double ipk) {
            this.nim = nim;
            this.nama = nama;
            this.ipk = ipk;
        }

        @Override
        public int compareTo(Mahasiswa lain) {
            if (ipk != lain.ipk) {
                return ipk > lain.ipk ? -1 : 1;
            }
            return nim.compareTo(lain.nim);
        }

        @Override
        public String toString() {
            return nim + " " + nama + " " + ipk;
        }
    }

    public static void main(String[] args) {
        ArrayList<Mahasiswa> kelas = new ArrayList<>();
        kelas.add(new Mahasiswa("H071", "Rina", 3.45));
        kelas.add(new Mahasiswa("H015", "Andi", 3.80));
        kelas.add(new Mahasiswa("H033", "Bayu", 3.45));
        kelas.add(new Mahasiswa("H002", "Tari", 2.95));
        kelas.add(new Mahasiswa("H090", "Doni", 3.80));
        kelas.add(new Mahasiswa("H047", "Maya", 3.12));
        Collections.sort(kelas);
        int peringkat = 1;
        for (Mahasiswa m : kelas) {
            System.out.println(peringkat++ + ". " + m);
        }
        System.out.println("min (terbaik) " + Collections.min(kelas).nama + ", max (terendah) " + Collections.max(kelas).nama);
        Collections.reverse(kelas);
        System.out.println("dibalik: " + kelas);
    }
}
