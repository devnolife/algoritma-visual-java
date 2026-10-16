// Tiga himpunan untuk kata yang sama: HashSet (urutan hash), LinkedHashSet (urutan sisip), TreeSet (urutan abjad); duplikat dibuang di ketiganya
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        String[] kata = {"pisang", "apel", "mangga", "apel", "jeruk", "Anggur", "pisang", "kiwi", "durian", "Mangga", "_bonus"};
        HashSet<String> hs = new HashSet<>();
        LinkedHashSet<String> lhs = new LinkedHashSet<>();
        TreeSet<String> ts = new TreeSet<>();
        for (String k : kata) {
            boolean baru = hs.add(k);
            lhs.add(k);
            ts.add(k);
            if (!baru) {
                System.out.println("duplikat: " + k);
            }
        }
        System.out.println("HashSet       " + hs);
        System.out.println("LinkedHashSet " + lhs);
        System.out.println("TreeSet       " + ts);
        System.out.println("ukuran " + hs.size() + " " + lhs.size() + " " + ts.size());
        lhs.remove("apel");
        lhs.add("apel");
        System.out.println("LinkedHashSet setelah remove+add apel: " + lhs);
        System.out.println("TreeSet first " + ts.first() + ", last " + ts.last());
        System.out.println("contains(\"mangga\") " + hs.contains("mangga") + ", contains(\"MANGGA\") " + hs.contains("MANGGA"));
    }
}
