// TreeMap dengan Comparator lambda: menurut panjang lalu abjad, hanya panjang (kunci "sama" digabung jadi satu), dan abjad terbalik
import java.util.TreeMap;

public class Main {
    public static void main(String[] args) {
        TreeMap<String, Integer> menurutPanjang = new TreeMap<>((a, b) -> {
            if (a.length() != b.length()) {
                return a.length() - b.length();
            }
            return a.compareTo(b);
        });
        TreeMap<String, Integer> hanyaPanjang = new TreeMap<>((a, b) -> a.length() - b.length());
        TreeMap<String, Integer> terbalik = new TreeMap<>((a, b) -> b.compareTo(a));
        String[] kata = {"kopi", "teh", "susu", "es", "jahe", "cokelat", "air"};
        for (int i = 0; i < kata.length; i++) {
            menurutPanjang.put(kata[i], i);
            hanyaPanjang.put(kata[i], i);
            terbalik.put(kata[i], i);
        }
        System.out.println("panjang lalu abjad : " + menurutPanjang);
        System.out.println("hanya panjang      : " + hanyaPanjang);
        System.out.println("abjad terbalik     : " + terbalik);
        System.out.println("hanyaPanjang.get(\"xyz\") = " + hanyaPanjang.get("xyz") + ", containsKey(\"abcd\") = " + hanyaPanjang.containsKey("abcd"));
        System.out.println("firstKey " + terbalik.firstKey() + ", lastKey " + terbalik.lastKey() + ", floorKey(\"m\") " + terbalik.floorKey("m"));
    }
}
