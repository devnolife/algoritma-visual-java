// Error: variabel lokal dipakai di lambda Comparator lalu diubah setelahnya (local variables referenced from a lambda expression must be final or effectively final)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> data = new ArrayList<>();
        data.add(15);
        data.add(4);
        data.add(9);
        int arah = 1;
        data.sort((a, b) -> arah * (a - b));
        System.out.println("naik: " + data);
        arah = -1;
        System.out.println("arah baru " + arah);
    }
}
