// Unboxing null menjadi NullPointerException: Integer null dari elemen ArrayList dan dari field objek; pesan JDK menyebut asal nilai null
import java.util.ArrayList;

public class Main {
    static class Nilai {
        String nama;
        Integer uts;
        Integer uas;

        Nilai(String nama, Integer uts, Integer uas) {
            this.nama = nama;
            this.uts = uts;
            this.uas = uas;
        }
    }

    public static void main(String[] args) {
        ArrayList<Integer> kehadiran = new ArrayList<>();
        kehadiran.add(14);
        kehadiran.add(null);
        kehadiran.add(12);
        int total = 0;
        for (int i = 0; i < kehadiran.size(); i++) {
            Integer h = kehadiran.get(i);
            if (h != null) {
                total += h;
            }
        }
        System.out.println("total kehadiran (null dilewati) = " + total);
        try {
            int pertemuan = kehadiran.get(1);
            System.out.println(pertemuan);
        } catch (NullPointerException e) {
            System.out.println("NPE: " + e.getMessage());
        }
        Nilai[] kelas = {new Nilai("Ani", 80, 90), new Nilai("Budi", 75, null)};
        for (Nilai n : kelas) {
            Integer uas = n.uas;
            System.out.println(n.nama + ": uts " + n.uts + ", uas " + uas + ", sudah lengkap? " + (uas != null));
        }
        for (Nilai n : kelas) {
            int akhir = (n.uts + n.uas) / 2;
            System.out.println(n.nama + " nilai akhir " + akhir);
        }
    }
}
