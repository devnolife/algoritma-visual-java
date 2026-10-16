// Error: elemen ArrayList<String> disimpan ke variabel int (incompatible types: String cannot be converted to int)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> angka = new ArrayList<>();
        angka.add("10");
        angka.add("25");
        int pertama = angka.get(0);
        System.out.println(pertama + 1);
    }
}
