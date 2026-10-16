// Stack.pop/peek pada stack kosong melempar EmptyStackException tanpa pesan; empty() dan isEmpty() untuk memeriksa dulu
import java.util.EmptyStackException;
import java.util.Stack;

public class Main {
    public static void main(String[] args) {
        Stack<String> riwayat = new Stack<>();
        riwayat.push("beranda");
        riwayat.push("profil");
        riwayat.push("pengaturan");
        System.out.println("riwayat " + riwayat + ", puncak " + riwayat.peek());
        while (!riwayat.empty()) {
            System.out.println("kembali dari " + riwayat.pop() + ", sisa " + riwayat);
        }
        try {
            riwayat.peek();
        } catch (EmptyStackException e) {
            System.out.println("peek: " + e + ", pesan " + e.getMessage());
        }
        System.out.println("isEmpty " + riwayat.isEmpty() + ", size " + riwayat.size());
        riwayat.push("tentang");
        System.out.println("pop " + riwayat.pop());
        System.out.println("pop lagi " + riwayat.pop());
    }
}
