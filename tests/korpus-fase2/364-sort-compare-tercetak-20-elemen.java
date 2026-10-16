// Comparator lambda mencetak setiap pasangan yang dibandingkan saat list.sort mengurutkan 20 elemen (n < 32: countRun lalu insertion sort biner)
import java.util.ArrayList;

public class Main {
    static int banding = 0;

    public static void main(String[] args) {
        ArrayList<Integer> data = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            data.add((i * 13 + 7) % 23);
        }
        System.out.println("awal  " + data);
        StringBuilder log = new StringBuilder();
        data.sort((a, b) -> {
            banding++;
            log.append(a).append(':').append(b).append(banding % 12 == 0 ? "\n" : " ");
            return a - b;
        });
        System.out.println(log.toString().trim());
        System.out.println("hasil " + data + ", " + banding + " perbandingan");
    }
}
