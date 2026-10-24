import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    static int[] data = new int[4];   // wadah isi stack
    static int atas = -1;             // indeks elemen teratas; -1 berarti kosong

    static void push(int x) {
        if (atas == data.length - 1) {
            throw new IllegalStateException("Stack penuh (overflow)");
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

        System.out.println("23*4+ = " + hitungPostfix("23*4+"));
        System.out.println("934*+2- = " + hitungPostfix("934*+2-"));
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

    // Angka di-push; operator mengambil dua angka teratas (yang pertama di-pop adalah operand kanan).
    static int hitungPostfix(String ekspresi) {
        Deque<Integer> tumpukan = new ArrayDeque<>();
        for (int i = 0; i < ekspresi.length(); i++) {
            char c = ekspresi.charAt(i);
            if (c >= '0' && c <= '9') {
                tumpukan.push(c - '0');
            } else {
                int kanan = tumpukan.pop();
                int kiri = tumpukan.pop();
                if (c == '+') {
                    tumpukan.push(kiri + kanan);
                } else if (c == '-') {
                    tumpukan.push(kiri - kanan);
                } else {
                    tumpukan.push(kiri * kanan);
                }
            }
        }
        return tumpukan.pop();
    }
}
