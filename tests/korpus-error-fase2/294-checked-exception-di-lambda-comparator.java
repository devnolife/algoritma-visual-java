// Error: lambda Comparator melempar exception checked; throws milik main tidak berlaku di dalam compare (unreported exception Exception; must be caught or declared to be thrown)
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) throws Exception {
        ArrayList<String> kode = new ArrayList<>();
        kode.add("B2");
        kode.add("A1");
        kode.add("");
        kode.sort((a, b) -> {
            if (a.isEmpty() || b.isEmpty()) {
                throw new Exception("kode kosong");
            }
            return a.compareTo(b);
        });
        System.out.println(kode);
    }
}
