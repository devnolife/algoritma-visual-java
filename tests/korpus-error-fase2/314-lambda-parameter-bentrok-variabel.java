// Error: nama parameter lambda sama dengan variabel lokal yang sudah ada (variable a is already defined in method main(String[]))
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> a = new ArrayList<>();
        a.add(5);
        a.add(2);
        a.sort((a, b) -> a - b);
        System.out.println(a);
    }
}
