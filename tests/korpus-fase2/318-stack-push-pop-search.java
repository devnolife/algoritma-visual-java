// Stack: push (mengembalikan elemen), pop, peek, search (posisi dari puncak, mulai 1), empty, size, get, dan toString dari dasar ke puncak
import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Stack<String> tumpukan = new Stack<>();
        String[] piring = {"merah", "biru", "hijau", "kuning"};
        for (String p : piring) {
            String kembali = tumpukan.push(p);
            System.out.println("push " + kembali + " -> " + tumpukan);
        }
        System.out.println("peek " + tumpukan.peek() + ", size " + tumpukan.size() + ", empty " + tumpukan.empty());
        System.out.println("search(kuning) " + tumpukan.search("kuning") + ", search(merah) " + tumpukan.search("merah") + ", search(ungu) " + tumpukan.search("ungu"));
        System.out.println("get(0) " + tumpukan.get(0) + ", get(size-1) " + tumpukan.get(tumpukan.size() - 1));
        System.out.println("pop " + tumpukan.pop() + ", pop " + tumpukan.pop() + " -> " + tumpukan);
        tumpukan.push("biru");
        System.out.println("push biru lagi -> " + tumpukan + ", search(biru) " + tumpukan.search("biru") + ", indexOf(biru) " + tumpukan.indexOf("biru"));
        try {
            tumpukan.get(7);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("get(7) -> " + e);
        }
        Stack<Integer> bilangan = new Stack<>();
        for (int i = 1; i <= 5; i++) {
            bilangan.push(i * i);
        }
        int jumlah = 0;
        while (!bilangan.isEmpty()) {
            jumlah += bilangan.pop();
        }
        System.out.println("jumlah kuadrat 1..5 = " + jumlah);
    }
}
