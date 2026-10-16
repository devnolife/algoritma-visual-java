// Operasi himpunan dengan HashSet<Integer>: gabungan (addAll), irisan dan selisih manual dengan contains, serta add/remove yang mengembalikan boolean
import java.util.HashSet;

public class Main {
    static HashSet<Integer> gabung(HashSet<Integer> x, HashSet<Integer> y) {
        HashSet<Integer> h = new HashSet<>(x);
        h.addAll(y);
        return h;
    }

    public static void main(String[] args) {
        HashSet<Integer> a = new HashSet<>();
        HashSet<Integer> b = new HashSet<>();
        int[] isiA = {1, 3, 5, 7, 9, 11, 3};
        int[] isiB = {3, 6, 9, 12, 15};
        for (int x : isiA) {
            System.out.println("a.add(" + x + ") -> " + a.add(x));
        }
        for (int x : isiB) {
            b.add(x);
        }
        System.out.println("A = " + a + ", B = " + b);
        System.out.println("A gabung B = " + gabung(a, b));
        HashSet<Integer> irisan = new HashSet<>();
        for (int x : a) {
            if (b.contains(x)) {
                irisan.add(x);
            }
        }
        System.out.println("A iris B = " + irisan);
        HashSet<Integer> selisih = new HashSet<>(a);
        for (int x : b) {
            selisih.remove(x);
        }
        System.out.println("A - B = " + selisih);
        System.out.println("(A - B) gabung (A iris B) sama dengan A? " + gabung(selisih, irisan).equals(a));
        System.out.println("remove(100) -> " + a.remove(100) + ", remove(1) -> " + a.remove(1) + ", A = " + a);
        HashSet<Integer> besar = new HashSet<>();
        for (int i = 0; i < 20; i++) {
            besar.add(i * 7 % 40);
        }
        System.out.println("20 kelipatan 7 mod 40: " + besar + " (" + besar.size() + ")");
    }
}
