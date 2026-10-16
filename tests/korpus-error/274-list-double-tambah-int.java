// Error: angka int ditambahkan ke List<Double> (incompatible types: int cannot be converted to Double)
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Double> berat = new ArrayList<>();
        berat.add(55.5);
        berat.add(60);
        System.out.println(berat);
    }
}
