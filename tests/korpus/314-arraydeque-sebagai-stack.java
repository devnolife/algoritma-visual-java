// ArrayDeque sebagai stack: push/pop/peek bekerja di depan deque, sehingga toString mencetak puncak stack lebih dulu
import java.util.ArrayDeque;

public class Main {
    public static void main(String[] args) {
        ArrayDeque<String> undo = new ArrayDeque<>();
        String[] aksi = {"ketik A", "ketik B", "hapus", "ketik C", "tebal"};
        for (String a : aksi) {
            undo.push(a);
            System.out.println("lakukan " + a + " -> stack " + undo);
        }
        System.out.println("puncak: " + undo.peek() + ", ukuran " + undo.size() + ", peekFirst " + undo.peekFirst() + ", peekLast " + undo.peekLast());
        for (int i = 0; i < 3; i++) {
            System.out.println("undo " + undo.pop() + " -> " + undo);
        }
        ArrayDeque<Integer> angka = new ArrayDeque<>();
        int n = 1234560;
        while (n > 0) {
            angka.push(n % 10);
            n /= 10;
        }
        System.out.println("digit di stack: " + angka);
        StringBuilder sb = new StringBuilder();
        while (!angka.isEmpty()) {
            sb.append(angka.pop());
        }
        System.out.println("digit dari stack: " + sb);
        ArrayDeque<Character> kurung = new ArrayDeque<>();
        for (char c : "((a)(b))".toCharArray()) {
            if (c == '(') {
                kurung.push(c);
            } else if (c == ')') {
                kurung.pop();
            }
            System.out.print(kurung.size() + " ");
        }
        System.out.println();
    }
}
