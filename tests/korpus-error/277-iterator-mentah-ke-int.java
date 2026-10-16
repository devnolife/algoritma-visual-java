// Error: Iterator mentah (tanpa <Integer>) menghasilkan Object yang tidak bisa disimpan ke int (incompatible types: Object cannot be converted to int)
import java.util.ArrayList;
import java.util.Iterator;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> data = new ArrayList<>();
        data.add(3);
        data.add(9);
        Iterator it = data.iterator();
        int total = 0;
        while (it.hasNext()) {
            int x = it.next();
            total += x;
        }
        System.out.println(total);
    }
}
