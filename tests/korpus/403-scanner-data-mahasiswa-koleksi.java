// Membaca data mahasiswa dari input (Scanner) ke ArrayList objek, mengurutkan dengan Comparator, lalu mengelompokkan per prodi dengan TreeMap
import java.util.ArrayList;
import java.util.Map;
import java.util.Scanner;
import java.util.TreeMap;

public class Main {
    static class Mahasiswa {
        String nim;
        String nama;
        String prodi;
        int nilai;

        Mahasiswa(String nim, String nama, String prodi, int nilai) {
            this.nim = nim;
            this.nama = nama;
            this.prodi = prodi;
            this.nilai = nilai;
        }

        @Override
        public String toString() {
            return nim + " " + nama + " (" + prodi + ") " + nilai;
        }
    }

    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        ArrayList<Mahasiswa> data = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            String nim = sc.next();
            String nama = sc.next();
            String prodi = sc.next();
            int nilai = sc.nextInt();
            data.add(new Mahasiswa(nim, nama, prodi, nilai));
        }
        System.out.println("dibaca " + data.size() + " mahasiswa");
        data.sort((a, b) -> {
            if (a.nilai != b.nilai) {
                return b.nilai - a.nilai;
            }
            return a.nama.compareTo(b.nama);
        });
        for (int i = 0; i < data.size(); i++) {
            System.out.println((i + 1) + ". " + data.get(i));
        }
        TreeMap<String, ArrayList<String>> perProdi = new TreeMap<>();
        TreeMap<String, Integer> totalProdi = new TreeMap<>();
        for (Mahasiswa m : data) {
            ArrayList<String> anggota = perProdi.get(m.prodi);
            if (anggota == null) {
                anggota = new ArrayList<>();
                perProdi.put(m.prodi, anggota);
            }
            anggota.add(m.nama);
            totalProdi.put(m.prodi, totalProdi.getOrDefault(m.prodi, 0) + m.nilai);
        }
        for (Map.Entry<String, ArrayList<String>> e : perProdi.entrySet()) {
            double rata = (double) totalProdi.get(e.getKey()) / e.getValue().size();
            System.out.printf("%-4s %-22s rata %.2f%n", e.getKey(), e.getValue(), rata);
        }
        String sisa = sc.hasNext() ? sc.next() : "(habis)";
        System.out.println("token setelah data: " + sisa);
    }
}
