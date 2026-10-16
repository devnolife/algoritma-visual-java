// Error: menambahkan String ke List<Integer> (incompatible types: String cannot be converted to Integer)
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> umur = new ArrayList<>();
        umur.add(19);
        umur.add(20);
        umur.add("dua puluh satu");
        System.out.println(umur);
    }
}
