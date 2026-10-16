// Error: elemen ArrayList diakses dengan kurung siku seperti array (array required, but ArrayList<Integer> found)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> skor = new ArrayList<>();
        skor.add(70);
        skor.add(95);
        int tertinggi = skor[1];
        System.out.println(tertinggi);
    }
}
