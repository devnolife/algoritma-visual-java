// Error: lambda untuk Comparator hanya punya satu parameter (incompatible types: incompatible parameter types in lambda expression)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> nilai = new ArrayList<>();
        nilai.add(70);
        nilai.add(50);
        nilai.sort(a -> a - 1);
        System.out.println(nilai);
    }
}
