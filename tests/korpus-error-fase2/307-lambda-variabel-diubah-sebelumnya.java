// Error: variabel lokal diubah lebih dulu lalu dipakai di lambda Comparator (local variables referenced from a lambda expression must be final or effectively final)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> kata = new ArrayList<>();
        kata.add("apel");
        kata.add("kiwi");
        kata.add("semangka");
        boolean menaik = true;
        if (kata.size() > 2) {
            menaik = false;
        }
        kata.sort((a, b) -> menaik ? a.length() - b.length() : b.length() - a.length());
        System.out.println(kata);
    }
}
