// Variasi unboxing null: Integer lokal dalam aritmetika, for-each atas List<Integer> berisi null (Iterator.next), field Integer ditambah satu, Double ke parameter double
import java.util.ArrayList;
import java.util.List;

public class Main {
    static class Statistik {
        Integer jumlah;
        Double rata;
    }

    static double kali2(double x) {
        return x * 2;
    }

    public static void main(String[] args) {
        Integer bonus = null;
        try {
            int total = 100 + bonus;
            System.out.println(total);
        } catch (NullPointerException e) {
            System.out.println("1: " + e.getMessage());
        }
        List<Integer> skor = new ArrayList<>();
        skor.add(90);
        skor.add(null);
        skor.add(70);
        int jumlah = 0;
        try {
            for (int s : skor) {
                jumlah += s;
            }
        } catch (NullPointerException e) {
            System.out.println("2: " + e.getMessage() + " (jumlah sementara " + jumlah + ")");
        }
        Statistik st = new Statistik();
        try {
            st.jumlah = st.jumlah + 1;
        } catch (NullPointerException e) {
            System.out.println("3: " + e.getMessage());
        }
        st.jumlah = 5;
        st.jumlah++;
        System.out.println("setelah diisi: jumlah " + st.jumlah + ", rata " + st.rata);
        System.out.println(kali2(st.rata));
    }
}
