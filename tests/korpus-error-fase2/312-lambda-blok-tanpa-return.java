// Error: badan lambda Comparator berbentuk blok tetapi lupa return (incompatible types: bad return type in lambda expression)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> skor = new ArrayList<>();
        skor.add(88);
        skor.add(92);
        skor.sort((a, b) -> {
            int selisih = b - a;
        });
        System.out.println(skor);
    }
}
