// Absensi kelas dengan ArrayList<String>: mencari yang tidak hadir, contains peka huruf besar, mengurutkan, dan String.join untuk mencetak
import java.util.ArrayList;
import java.util.Collections;

public class Main {
    public static void main(String[] args) {
        String[] daftarKelas = {"Rina", "Andi", "Maya", "Bayu", "Tari", "Doni"};
        ArrayList<String> hadir = new ArrayList<>();
        String[] scan = {"andi", "Maya", "Tari", "Maya", "Rina ", "Doni"};
        for (String s : scan) {
            String rapi = s.trim();
            rapi = rapi.substring(0, 1).toUpperCase() + rapi.substring(1);
            if (hadir.contains(rapi)) {
                System.out.println("duplikat diabaikan: " + rapi);
            } else {
                hadir.add(rapi);
            }
        }
        System.out.println("hadir (" + hadir.size() + "): " + hadir);
        ArrayList<String> absen = new ArrayList<>();
        for (String nama : daftarKelas) {
            if (!hadir.contains(nama)) {
                absen.add(nama);
            }
        }
        System.out.println("tidak hadir: " + String.join(", ", absen));
        System.out.println("contains(\"maya\") = " + hadir.contains("maya") + ", contains(\"Maya\") = " + hadir.contains("Maya"));
        Collections.sort(hadir);
        System.out.println("hadir terurut: " + String.join(" | ", hadir));
        double persen = 100.0 * hadir.size() / daftarKelas.length;
        System.out.printf("kehadiran %.1f%%%n", persen);
        StringBuilder inisial = new StringBuilder();
        for (String h : hadir) {
            inisial.append(h.charAt(0));
        }
        System.out.println("inisial: " + inisial);
    }
}
