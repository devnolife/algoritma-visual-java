// Error: angka ditambahkan langsung ke list luar ArrayList<ArrayList<Integer>> (incompatible types: int cannot be converted to ArrayList<Integer>)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<ArrayList<Integer>> graf = new ArrayList<>();
        for (int i = 0; i < 3; i++) {
            graf.add(new ArrayList<>());
        }
        graf.get(0).add(1);
        graf.add(2);
        System.out.println(graf);
    }
}
