// Error: ukuran ArrayList diambil dengan length() seperti String (cannot find symbol, symbol: method length())
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> data = new ArrayList<>();
        data.add(4);
        data.add(8);
        for (int i = 0; i < data.length(); i++) {
            System.out.println(data.get(i));
        }
    }
}
