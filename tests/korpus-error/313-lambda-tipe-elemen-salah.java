// Error: lambda Comparator untuk list String memakai pengurangan seperti pada angka (bad operand types for binary operator '-')
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> kota = new ArrayList<>();
        kota.add("Palu");
        kota.add("Ambon");
        kota.sort((a, b) -> a - b);
        System.out.println(kota);
    }
}
