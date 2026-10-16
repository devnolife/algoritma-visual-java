// Error: elemen HashSet diambil dengan get(indeks) padahal Set tidak berindeks (cannot find symbol, symbol: method get(int))
import java.util.HashSet;

public class Main {
    public static void main(String[] args) {
        HashSet<String> unik = new HashSet<>();
        unik.add("merah");
        unik.add("biru");
        System.out.println("pertama: " + unik.get(0));
    }
}
