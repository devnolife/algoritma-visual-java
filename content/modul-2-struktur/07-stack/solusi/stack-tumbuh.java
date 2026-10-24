import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    static int[] data = new int[4];   // wadah isi stack
    static int atas = -1;             // indeks elemen teratas; -1 berarti kosong

    // Bila penuh, stack tumbuh: array baru berkapasitas 2x, isinya disalin, lalu data menunjuk array baru.
    static void push(int x) {
        if (atas == data.length - 1) {
            int[] baru = new int[data.length * 2];
            for (int i = 0; i < data.length; i++) {
                baru[i] = data[i];
            }
            data = baru;
        }
        atas++;
        data[atas] = x;   // #push
    }

    static int pop() {
        if (atas == -1) {
            throw new IllegalStateException("Stack kosong (underflow)");
        }
        int x = data[atas];
        atas--;   // #pop
        return x;
    }

    public static void main(String[] args) {
        push(10);
        push(20);
        push(30);
        System.out.println("pop: " + pop());
        push(40);
        push(50);
        System.out.print("Isi dari puncak:");
        while (atas >= 0) {
            System.out.print(" " + pop());
        }
        System.out.println();

        String teks = "{[()()]}";
        System.out.println(teks + " seimbang? " + seimbang(teks));

        System.out.print("Kapasitas:");
        for (int i = 1; i <= 6; i++) {
            push(i * 100);
            System.out.print(" " + data.length);
        }
        System.out.println();
    }

    static boolean seimbang(String teks) {
        Deque<Character> tumpukan = new ArrayDeque<>();
        for (int i = 0; i < teks.length(); i++) {
            char c = teks.charAt(i);
            if (c == '(' || c == '[' || c == '{') {
                tumpukan.push(c);
            } else {
                if (tumpukan.isEmpty() || tumpukan.peek() != pasangan(c)) {   // #tutup
                    return false;
                }
                tumpukan.pop();
            }
        }
        return tumpukan.isEmpty();
    }

    static char pasangan(char tutup) {
        if (tutup == ')') return '(';
        if (tutup == ']') return '[';
        return '{';
    }
}
