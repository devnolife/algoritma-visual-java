// Masalah Josephus dengan ArrayDeque: setiap orang ke-k dikeluarkan dengan memutar antrian (poll lalu offer)
import java.util.ArrayDeque;

public class Main {
    static int josephus(int n, int k) {
        ArrayDeque<Integer> lingkaran = new ArrayDeque<>();
        for (int i = 1; i <= n; i++) {
            lingkaran.offer(i);
        }
        StringBuilder urutanKeluar = new StringBuilder();
        while (lingkaran.size() > 1) {
            for (int i = 1; i < k; i++) {
                lingkaran.offer(lingkaran.poll());
            }
            int keluar = lingkaran.poll();
            urutanKeluar.append(keluar).append(' ');
            System.out.println("  keluar " + keluar + ", lingkaran " + lingkaran);
        }
        System.out.println("  urutan keluar: " + urutanKeluar.toString().trim());
        return lingkaran.peek();
    }

    public static void main(String[] args) {
        System.out.println("n=7, k=3:");
        System.out.println("selamat: " + josephus(7, 3));
        System.out.println("n=6, k=2:");
        System.out.println("selamat: " + josephus(6, 2));
    }
}
