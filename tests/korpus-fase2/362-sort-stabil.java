// Pengurutan objek di Java stabil: elemen dengan kunci sama mempertahankan urutan sebelumnya, sehingga sort bertahap (nama lalu kelas) bekerja
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    static class Siswa {
        String nama;
        char kelas;
        int nilai;

        Siswa(String nama, char kelas, int nilai) {
            this.nama = nama;
            this.kelas = kelas;
            this.nilai = nilai;
        }

        @Override
        public String toString() {
            return nama + "/" + kelas + "/" + nilai;
        }
    }

    public static void main(String[] args) {
        ArrayList<Siswa> s = new ArrayList<>();
        String[] nama = {"Wati", "Adi", "Sari", "Budi", "Lina", "Joko", "Ema", "Tono"};
        char[] kelas = {'B', 'A', 'B', 'A', 'C', 'B', 'A', 'C'};
        int[] nilai = {80, 75, 80, 90, 75, 60, 90, 80};
        for (int i = 0; i < nama.length; i++) {
            s.add(new Siswa(nama[i], kelas[i], nilai[i]));
        }
        System.out.println("asli          : " + s);
        s.sort((a, b) -> b.nilai - a.nilai);
        System.out.println("nilai turun   : " + s);
        s.sort((a, b) -> a.nama.compareTo(b.nama));
        s.sort((a, b) -> a.kelas - b.kelas);
        System.out.println("nama lalu kelas (stabil): " + s);
        Collections.sort(s, (a, b) -> b.nilai - a.nilai);
        System.out.println("nilai turun, seri tetap urut kelas+nama: " + s);
    }
}
