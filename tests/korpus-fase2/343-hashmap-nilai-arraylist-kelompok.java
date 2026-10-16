// HashMap<String, ArrayList<String>> untuk mengelompokkan mahasiswa per jurusan: ambil list, buat bila belum ada, lalu tambahkan
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        String[][] data = {
            {"Ani", "Informatika"}, {"Budi", "Sipil"}, {"Cici", "Informatika"}, {"Dodi", "Arsitektur"},
            {"Eka", "Sipil"}, {"Fajar", "Informatika"}, {"Gita", "Arsitektur"}, {"Hadi", "Mesin"}
        };
        HashMap<String, ArrayList<String>> perJurusan = new HashMap<>();
        for (String[] d : data) {
            ArrayList<String> daftar = perJurusan.get(d[1]);
            if (daftar == null) {
                daftar = new ArrayList<>();
                perJurusan.put(d[1], daftar);
                System.out.println("jurusan baru: " + d[1]);
            }
            daftar.add(d[0]);
        }
        System.out.println(perJurusan);
        for (Map.Entry<String, ArrayList<String>> e : perJurusan.entrySet()) {
            System.out.println(e.getKey() + " (" + e.getValue().size() + "): " + String.join(", ", e.getValue()));
        }
        perJurusan.get("Sipil").remove("Budi");
        perJurusan.get("Mesin").clear();
        System.out.println("setelah perubahan lewat get: " + perJurusan);
        String terbesar = null;
        for (String j : perJurusan.keySet()) {
            if (terbesar == null || perJurusan.get(j).size() > perJurusan.get(terbesar).size()) {
                terbesar = j;
            }
        }
        System.out.println("jurusan terbanyak: " + terbesar);
    }
}
