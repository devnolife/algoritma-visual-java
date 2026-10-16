// new PriorityQueue<>(list) membangun heap sekaligus (heapify, siftDown dari tengah) sehingga isi array bisa berbeda dari menambah satu per satu, walau urutan poll sama
import java.util.ArrayList;
import java.util.PriorityQueue;

public class Main {
    static void bandingkan(int[] isi) {
        ArrayList<Integer> data = new ArrayList<>();
        for (int x : isi) {
            data.add(x);
        }
        PriorityQueue<Integer> satuPerSatu = new PriorityQueue<>();
        for (int x : data) {
            satuPerSatu.offer(x);
        }
        PriorityQueue<Integer> heapify = new PriorityQueue<>(data);
        System.out.println("data          : " + data);
        System.out.println("satu per satu : " + satuPerSatu);
        System.out.println("heapify       : " + heapify);
        StringBuilder a = new StringBuilder();
        StringBuilder b = new StringBuilder();
        while (!satuPerSatu.isEmpty()) {
            a.append(satuPerSatu.poll()).append(' ');
            b.append(heapify.poll()).append(' ');
        }
        System.out.println("poll keduanya : " + a.toString().trim() + " | " + b.toString().trim());
    }

    public static void main(String[] args) {
        bandingkan(new int[] {9, 4, 7, 1, 8, 2, 6, 3, 5});
        bandingkan(new int[] {10, 9, 8, 7, 6, 5, 4, 3, 2, 1});
        bandingkan(new int[] {4, 4, 1, 4, 1});
    }
}
