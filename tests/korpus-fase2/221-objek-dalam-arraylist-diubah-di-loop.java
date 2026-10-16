// Objek di dalam ArrayList: for-each bisa mengubah isi objek, tetapi menugaskan ulang variabel loop tidak mengubah list
import java.util.ArrayList;

public class Main {
    static class Tugas {
        String judul;
        boolean selesai;
        int prioritas;

        Tugas(String judul, int prioritas) {
            this.judul = judul;
            this.prioritas = prioritas;
        }

        String teks() {
            return (selesai ? "[x] " : "[ ] ") + judul + " (p" + prioritas + ")";
        }
    }

    static void cetak(ArrayList<Tugas> daftar) {
        for (Tugas t : daftar) {
            System.out.println("  " + t.teks());
        }
    }

    public static void main(String[] args) {
        ArrayList<Tugas> daftar = new ArrayList<>();
        daftar.add(new Tugas("Kerjakan kuis", 2));
        daftar.add(new Tugas("Baca bab 3", 1));
        daftar.add(new Tugas("Latihan soal", 3));
        cetak(daftar);
        for (Tugas t : daftar) {
            if (t.prioritas >= 2) {
                t.selesai = true;
            }
        }
        System.out.println("Setelah menandai prioritas >= 2:");
        cetak(daftar);
        for (Tugas t : daftar) {
            t = new Tugas("Pengganti", 9);
        }
        System.out.println("Setelah menugaskan ulang variabel loop:");
        cetak(daftar);
        Tugas pertama = daftar.get(0);
        pertama.judul = "Kerjakan kuis 2";
        daftar.set(1, new Tugas("Baca bab 4", 1));
        System.out.println("Setelah get-ubah dan set:");
        cetak(daftar);
        int belum = 0;
        for (int i = 0; i < daftar.size(); i++) {
            if (!daftar.get(i).selesai) {
                belum++;
            }
        }
        System.out.println("Belum selesai: " + belum + " dari " + daftar.size());
    }
}
