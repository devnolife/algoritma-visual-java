// Error: lambda Comparator menghitung jumlah perbandingan dengan mengubah variabel lokal di luar lambda (local variables referenced from a lambda expression must be final or effectively final)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> data = new ArrayList<>();
        data.add(3);
        data.add(1);
        data.add(2);
        int banding = 0;
        data.sort((a, b) -> {
            banding++;
            return a - b;
        });
        System.out.println(data + " dengan " + banding + " perbandingan");
    }
}
