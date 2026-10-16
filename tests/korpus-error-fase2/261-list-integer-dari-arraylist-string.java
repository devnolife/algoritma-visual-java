// Error: ArrayList<String> disimpan ke variabel List<Integer> (incompatible types: ArrayList<String> cannot be converted to List<Integer>)
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<Integer> nilai = new ArrayList<String>();
        System.out.println(nilai.size());
    }
}
