// Min-heap berbasis array buatan sendiri: siftUp saat sisip dan siftDown saat ambil minimum, isi array dicetak setiap operasi (heap sort)
import java.util.Arrays;

public class Main {
    static int[] heap = new int[16];
    static int ukuran = 0;

    static void tukar(int i, int j) {
        int t = heap[i];
        heap[i] = heap[j];
        heap[j] = t;
    }

    static void sisip(int x) {
        heap[ukuran] = x;
        int i = ukuran;
        ukuran++;
        int naik = 0;
        while (i > 0 && heap[(i - 1) / 2] > heap[i]) {
            tukar(i, (i - 1) / 2);
            i = (i - 1) / 2;
            naik++;
        }
        System.out.println("sisip " + x + " (naik " + naik + "x): " + Arrays.toString(Arrays.copyOf(heap, ukuran)));
    }

    static int ambilMin() {
        int min = heap[0];
        ukuran--;
        heap[0] = heap[ukuran];
        int i = 0;
        while (true) {
            int kiri = 2 * i + 1;
            int kanan = 2 * i + 2;
            int terkecil = i;
            if (kiri < ukuran && heap[kiri] < heap[terkecil]) {
                terkecil = kiri;
            }
            if (kanan < ukuran && heap[kanan] < heap[terkecil]) {
                terkecil = kanan;
            }
            if (terkecil == i) {
                break;
            }
            tukar(i, terkecil);
            i = terkecil;
        }
        System.out.println("ambil " + min + ": " + Arrays.toString(Arrays.copyOf(heap, ukuran)));
        return min;
    }

    public static void main(String[] args) {
        int[] data = {35, 12, 47, 8, 20, 3, 41, 15, 9};
        for (int d : data) {
            sisip(d);
        }
        StringBuilder urut = new StringBuilder();
        while (ukuran > 0) {
            urut.append(ambilMin()).append(' ');
        }
        System.out.println("heap sort: " + urut.toString().trim());
    }
}
