// String berbeda dengan hashCode sama ("Aa", "BB", "C#" = 2112; "AaAa", "BBBB", "AaBB", "BBAa") jatuh di bucket yang sama dan berurutan sesuai sisip
import java.util.HashMap;

public class Main {
    public static void main(String[] args) {
        String[] kunci = {"BB", "Aa", "C#", "AaAa", "BBBB", "AaBB", "BBAa", "Ab"};
        HashMap<String, Integer> peta = new HashMap<>();
        for (int i = 0; i < kunci.length; i++) {
            String k = kunci[i];
            System.out.println(k + " hashCode " + k.hashCode());
            peta.put(k, i);
            System.out.println("  peta " + peta);
        }
        System.out.println("get(Aa) " + peta.get("Aa") + ", get(BB) " + peta.get("BB") + ", get(AaBB) " + peta.get("AaBB"));
        peta.remove("AaAa");
        System.out.println("remove AaAa: " + peta);
        peta.put("AaAa", 99);
        System.out.println("put AaAa lagi (pindah ke ujung bucket): " + peta);
        peta.put("BB", -1);
        System.out.println("put BB (kunci ada, posisi tetap): " + peta);
    }
}
