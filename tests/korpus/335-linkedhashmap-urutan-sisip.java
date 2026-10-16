// LinkedHashMap mempertahankan urutan sisip: put ulang kunci lama tidak mengubah posisi, remove lalu put memindahkannya ke belakang
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;

public class Main {
    public static void main(String[] args) {
        LinkedHashMap<String, Integer> jadwal = new LinkedHashMap<>();
        HashMap<String, Integer> biasa = new HashMap<>();
        String[] hari = {"Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"};
        for (int i = 0; i < hari.length; i++) {
            jadwal.put(hari[i], i + 1);
            biasa.put(hari[i], i + 1);
        }
        System.out.println("LinkedHashMap: " + jadwal);
        System.out.println("HashMap      : " + biasa);
        jadwal.put("Rabu", 30);
        System.out.println("put ulang Rabu: " + jadwal);
        jadwal.remove("Selasa");
        jadwal.put("Selasa", 20);
        System.out.println("remove lalu put Selasa: " + jadwal);
        jadwal.putIfAbsent("Minggu", 7);
        jadwal.putIfAbsent("Senin", 100);
        System.out.println("putIfAbsent Minggu dan Senin: " + jadwal);
        StringBuilder sb = new StringBuilder();
        for (Map.Entry<String, Integer> e : jadwal.entrySet()) {
            sb.append(e.getKey().charAt(0)).append(e.getValue()).append(' ');
        }
        System.out.println("ringkas: " + sb.toString().trim());
        System.out.println("keySet " + jadwal.keySet() + ", values " + jadwal.values());
    }
}
