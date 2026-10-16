// addAll, salinan new ArrayList<>(lain) yang independen, dan alias lewat penugasan yang berbagi list yang sama
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> a = new ArrayList<>();
        a.add(1);
        a.add(2);
        a.add(3);
        ArrayList<Integer> b = new ArrayList<>();
        b.add(10);
        b.add(20);
        a.addAll(b);
        System.out.println("a.addAll(b): a = " + a + ", b = " + b);
        a.addAll(1, b);
        System.out.println("a.addAll(1, b): a = " + a);
        ArrayList<Integer> salinan = new ArrayList<>(a);
        ArrayList<Integer> alias = a;
        a.set(0, 99);
        alias.add(-1);
        salinan.remove(0);
        System.out.println("a       = " + a);
        System.out.println("alias   = " + alias + ", alias == a: " + (alias == a));
        System.out.println("salinan = " + salinan + ", salinan.equals(a): " + salinan.equals(a));
        ArrayList<Integer> diriSendiri = new ArrayList<>(b);
        diriSendiri.addAll(diriSendiri);
        System.out.println("addAll ke dirinya sendiri: " + diriSendiri);
        ArrayList<ArrayList<Integer>> kumpulan = new ArrayList<>();
        kumpulan.add(b);
        kumpulan.add(new ArrayList<>(b));
        b.add(30);
        System.out.println("kumpulan berisi b dan salinan b: " + kumpulan);
        System.out.println("addAll list kosong mengembalikan " + a.addAll(new ArrayList<>()) + ", addAll(b) mengembalikan " + a.addAll(b));
    }
}
