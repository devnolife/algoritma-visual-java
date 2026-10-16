// Exception di dalam lambda Comparator: stack trace memuat frame lambda$main$N di antara frame internal pengurutan JDK
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    static class Peserta {
        String nama;
        Integer skor;

        Peserta(String nama, Integer skor) {
            this.nama = nama;
            this.skor = skor;
        }

        @Override
        public String toString() {
            return nama + ":" + skor;
        }
    }

    public static void main(String[] args) {
        ArrayList<Peserta> daftar = new ArrayList<>();
        daftar.add(new Peserta("Ani", 80));
        daftar.add(new Peserta("Budi", 95));
        daftar.add(new Peserta("Cici", 70));
        daftar.sort((a, b) -> b.skor - a.skor);
        System.out.println("urut skor turun: " + daftar);
        Collections.sort(daftar, (a, b) -> a.nama.compareTo(b.nama));
        System.out.println("urut nama: " + daftar);
        daftar.add(new Peserta("Dodi", null));
        System.out.println("menambah peserta tanpa skor: " + daftar);
        daftar.sort((a, b) -> {
            int beda = a.skor - b.skor;
            return beda != 0 ? beda : a.nama.compareTo(b.nama);
        });
        System.out.println("tidak tercetak");
    }
}
