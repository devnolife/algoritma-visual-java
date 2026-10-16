// Error: lambda Comparator mengembalikan String, bukan int (incompatible types: bad return type in lambda expression)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> nama = new ArrayList<>();
        nama.add("Budi");
        nama.add("Ani");
        nama.sort((a, b) -> a + b);
        System.out.println(nama);
    }
}
