// Deque<Character> untuk cek palindrom: pollFirst dan pollLast dibandingkan berpasangan dari kedua ujung
import java.util.ArrayDeque;
import java.util.Deque;

public class Main {
    static boolean palindrom(String kata) {
        Deque<Character> dq = new ArrayDeque<>();
        for (char c : kata.toLowerCase().toCharArray()) {
            if (Character.isLetter(c)) {
                dq.addLast(c);
            }
        }
        while (dq.size() > 1) {
            char depan = dq.pollFirst();
            char belakang = dq.pollLast();
            if (depan != belakang) {
                System.out.println("  beda: " + depan + " vs " + belakang + ", sisa " + dq);
                return false;
            }
        }
        System.out.println("  sisa di tengah: " + dq);
        return true;
    }

    public static void main(String[] args) {
        String[] kata = {"Katak", "Malam", "Rotator", "Kodok", "Ibu Ratna antar ubi", "Jakarta"};
        for (String k : kata) {
            System.out.println(k + ":");
            System.out.println("  palindrom = " + palindrom(k));
        }
    }
}
