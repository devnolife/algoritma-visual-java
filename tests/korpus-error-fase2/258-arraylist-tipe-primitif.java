// Error: ArrayList dengan tipe primitif int sebagai argumen tipe (unexpected type)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<int> nilai = new ArrayList<>();
        nilai.add(90);
        System.out.println(nilai);
    }
}
