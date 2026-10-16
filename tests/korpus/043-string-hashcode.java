// hashCode String: rumus s[0]*31^(n-1) + ... dengan overflow int
public class Main {
    static int hashManual(String s) {
        int h = 0;
        for (int i = 0; i < s.length(); i++) {
            h = 31 * h + s.charAt(i);
        }
        return h;
    }

    public static void main(String[] args) {
        String[] data = {"", "a", "b", "ab", "halo", "Aa", "BB", "Indonesia", "algoritma dan pemrograman"};
        for (String s : data) {
            int bawaan = s.hashCode();
            int manual = hashManual(s);
            System.out.println("\"" + s + "\" -> " + bawaan + (bawaan == manual ? " (cocok)" : " (BEDA " + manual + ")"));
        }
        System.out.println("Aa dan BB sama? " + ("Aa".hashCode() == "BB".hashCode()));
        System.out.println("Aa equals BB? " + "Aa".equals("BB"));
        System.out.println("Ember dari 16: " + Math.floorMod("Indonesia".hashCode(), 16));
        System.out.println("abs hash: " + Math.abs("algoritma dan pemrograman".hashCode()));
        String gabungan = "ha" + "lo";
        System.out.println("hash konstanta sama: " + (gabungan.hashCode() == "halo".hashCode()));
    }
}
