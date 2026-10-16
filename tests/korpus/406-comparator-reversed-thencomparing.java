import java.util.*;

public class Main {
    static class Mahasiswa {
        String nama;
        double ipk;
        int angkatan;

        Mahasiswa(String nama, double ipk, int angkatan) {
            this.nama = nama;
            this.ipk = ipk;
            this.angkatan = angkatan;
        }

        @Override
        public String toString() {
            return nama + "(" + ipk + ", " + angkatan + ")";
        }
    }

    static int panggilan = 0;

    public static void main(String[] args) {
        List<Mahasiswa> kelas = new ArrayList<>();
        kelas.add(new Mahasiswa("Dewi", 3.5, 2023));
        kelas.add(new Mahasiswa("Andi", 3.8, 2022));
        kelas.add(new Mahasiswa("Budi", 3.5, 2022));
        kelas.add(new Mahasiswa("Cici", 3.8, 2023));
        kelas.add(new Mahasiswa("Eko", 3.2, 2022));

        Comparator<Mahasiswa> perIpk = (a, b) -> Double.compare(a.ipk, b.ipk);
        Comparator<Mahasiswa> perNama = (a, b) -> {
            panggilan++;
            return a.nama.compareTo(b.nama);
        };
        kelas.sort(perIpk.reversed());
        System.out.println("ipk menurun: " + kelas);
        kelas.sort(perIpk.reversed().thenComparing(perNama));
        System.out.println("ipk menurun, lalu nama: " + kelas);
        System.out.println("perNama dipanggil " + panggilan + " kali");

        Comparator<Mahasiswa> perAngkatan = (a, b) -> Integer.compare(a.angkatan, b.angkatan);
        kelas.sort(perAngkatan.thenComparing(perIpk.reversed()).thenComparing(perNama));
        System.out.println("angkatan, ipk menurun, nama: " + kelas);

        Comparator<Mahasiswa> dua = perNama.reversed().reversed();
        System.out.println("reversed dua kali: " + (dua == perNama));
        Collections.sort(kelas, Collections.reverseOrder(perNama));
        System.out.println("reverseOrder(perNama): " + kelas);
        Comparator<Mahasiswa> tidakAda = null;
        Comparator<Mahasiswa> terbalik = Collections.reverseOrder();
        System.out.println("reverseOrder(null): " + (Collections.reverseOrder(tidakAda) == terbalik));
        try {
            perIpk.thenComparing(tidakAda);
        } catch (NullPointerException e) {
            System.out.println("thenComparing(null): " + e.getMessage());
        }
        System.out.println("compare langsung: " + perIpk.reversed().compare(kelas.get(0), kelas.get(1)));

        PriorityQueue<Mahasiswa> antre = new PriorityQueue<>(perIpk.reversed().thenComparing(perNama));
        antre.addAll(kelas);
        StringBuilder urutan = new StringBuilder();
        while (!antre.isEmpty()) {
            urutan.append(antre.poll().nama).append(' ');
        }
        System.out.println("prioritas: " + urutan.toString().trim());
    }
}
