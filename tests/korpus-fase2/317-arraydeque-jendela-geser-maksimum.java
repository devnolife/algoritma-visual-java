// Maksimum jendela geser dengan ArrayDeque berisi indeks: pollLast membuang yang lebih kecil, pollFirst membuang yang keluar jendela
import java.util.ArrayDeque;

public class Main {
    public static void main(String[] args) {
        int[] suhu = {31, 29, 33, 35, 30, 28, 34, 36, 32, 27};
        int k = 3;
        ArrayDeque<Integer> dq = new ArrayDeque<>();
        StringBuilder hasil = new StringBuilder();
        for (int i = 0; i < suhu.length; i++) {
            while (!dq.isEmpty() && dq.peekFirst() <= i - k) {
                dq.pollFirst();
            }
            while (!dq.isEmpty() && suhu[dq.peekLast()] <= suhu[i]) {
                dq.pollLast();
            }
            dq.offerLast(i);
            System.out.println("i=" + i + " suhu=" + suhu[i] + " deque indeks " + dq);
            if (i >= k - 1) {
                hasil.append(suhu[dq.peekFirst()]).append(' ');
            }
        }
        System.out.println("maks tiap 3 hari: " + hasil.toString().trim());
    }
}
