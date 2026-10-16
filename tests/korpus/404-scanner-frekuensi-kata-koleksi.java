// Membaca teks dari input sampai habis (hasNextLine), menghitung frekuensi kata dengan HashMap, urutan pertama muncul dengan LinkedHashSet, dan 3 kata teratas dengan PriorityQueue
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.PriorityQueue;
import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        HashMap<String, Integer> frek = new HashMap<>();
        LinkedHashSet<String> urutanMuncul = new LinkedHashSet<>();
        int baris = 0;
        int totalKata = 0;
        while (sc.hasNextLine()) {
            String line = sc.nextLine().trim();
            baris++;
            if (line.isEmpty()) {
                System.out.println("baris " + baris + " kosong");
                continue;
            }
            for (String kata : line.toLowerCase().split(" ")) {
                if (kata.isEmpty()) {
                    continue;
                }
                frek.put(kata, frek.getOrDefault(kata, 0) + 1);
                urutanMuncul.add(kata);
                totalKata++;
            }
        }
        System.out.println(baris + " baris, " + totalKata + " kata, " + frek.size() + " kata unik");
        System.out.println("urutan pertama muncul: " + urutanMuncul);
        System.out.println("frekuensi: " + frek);
        PriorityQueue<String> teratas = new PriorityQueue<>((a, b) -> {
            int beda = frek.get(b) - frek.get(a);
            return beda != 0 ? beda : a.compareTo(b);
        });
        for (String k : frek.keySet()) {
            teratas.offer(k);
        }
        for (int i = 1; i <= 3; i++) {
            String k = teratas.poll();
            System.out.println(i + ". " + k + " (" + frek.get(k) + ")");
        }
    }
}
