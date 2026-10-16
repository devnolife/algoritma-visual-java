// Bubble sort dengan jejak setiap putaran, jumlah tukar, dan berhenti lebih awal
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] data = {29, 10, 14, 37, 13, 5, 88, 1};
        System.out.println("Awal    : " + Arrays.toString(data));
        int tukar = 0;
        int bandingkan = 0;
        for (int putaran = 0; putaran < data.length - 1; putaran++) {
            boolean adaTukar = false;
            for (int j = 0; j < data.length - 1 - putaran; j++) {
                bandingkan++;
                if (data[j] > data[j + 1]) {
                    int tmp = data[j];
                    data[j] = data[j + 1];
                    data[j + 1] = tmp;
                    tukar++;
                    adaTukar = true;
                }
            }
            System.out.println("Putaran " + (putaran + 1) + ": " + Arrays.toString(data));
            if (!adaTukar) {
                System.out.println("Tidak ada pertukaran, berhenti lebih awal");
                break;
            }
        }
        System.out.println("Perbandingan: " + bandingkan + ", pertukaran: " + tukar);
        String[] nama = {"Wati", "Andi", "Rudi", "Bela"};
        for (int i = 0; i < nama.length - 1; i++) {
            for (int j = 0; j < nama.length - 1 - i; j++) {
                if (nama[j].compareTo(nama[j + 1]) > 0) {
                    String t = nama[j];
                    nama[j] = nama[j + 1];
                    nama[j + 1] = t;
                }
            }
        }
        System.out.println("Nama terurut: " + Arrays.toString(nama));
    }
}
