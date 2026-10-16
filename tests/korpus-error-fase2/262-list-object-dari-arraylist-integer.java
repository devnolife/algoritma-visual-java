// Error: ArrayList<Integer> disimpan ke List<Object>; generik tidak kovarian (incompatible types: ArrayList<Integer> cannot be converted to List<Object>)
import java.util.ArrayList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> angka = new ArrayList<>();
        angka.add(7);
        List<Object> semua = angka;
        semua.add("teks");
        System.out.println(semua);
    }
}
