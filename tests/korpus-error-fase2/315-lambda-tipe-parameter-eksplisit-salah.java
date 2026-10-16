// Error: tipe parameter lambda ditulis String padahal elemen list Integer; javac menyimpulkan lambda sebagai Comparator<String> (incompatible types: Comparator<String> cannot be converted to Comparator<? super Integer>)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> umur = new ArrayList<>();
        umur.add(20);
        umur.add(18);
        umur.sort((String a, String b) -> a.compareTo(b));
        System.out.println(umur);
    }
}
