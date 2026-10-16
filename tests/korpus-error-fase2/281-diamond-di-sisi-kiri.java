// Error: tanda diamond <> ditulis di sisi kiri deklarasi (illegal start of type)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<> kota = new ArrayList<String>();
        kota.add("Makassar");
        System.out.println(kota);
    }
}
