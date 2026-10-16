// Error: size dipakai tanpa tanda kurung; karena ArrayList punya field private bernama size, javac tidak berkata "cannot find symbol" (size has private access in ArrayList)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> nama = new ArrayList<>();
        nama.add("Ani");
        nama.add("Budi");
        System.out.println("Jumlah: " + nama.size);
    }
}
