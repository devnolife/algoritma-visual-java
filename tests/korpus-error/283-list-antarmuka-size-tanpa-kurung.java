// Error: size tanpa tanda kurung pada variabel bertipe antarmuka List (cannot find symbol, symbol: variable size, location: variable nama of type List<String>)
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> nama = new ArrayList<>();
        nama.add("Ani");
        nama.add("Budi");
        for (int i = 0; i < nama.size; i++) {
            System.out.println(nama.get(i));
        }
    }
}
