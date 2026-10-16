// Insertion sort pada int dan char dengan jumlah pergeseran
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int[] data = {5, 2, 9, 1, 5, 6, -4, 0};
        int geser = 0;
        for (int i = 1; i < data.length; i++) {
            int kunci = data[i];
            int j = i - 1;
            while (j >= 0 && data[j] > kunci) {
                data[j + 1] = data[j];
                j--;
                geser++;
            }
            data[j + 1] = kunci;
            System.out.println("Sisipkan " + kunci + " -> " + Arrays.toString(data));
        }
        System.out.println("Jumlah pergeseran: " + geser);
        char[] huruf = "INFORMATIKA".toCharArray();
        for (int i = 1; i < huruf.length; i++) {
            char kunci = huruf[i];
            int j = i - 1;
            while (j >= 0 && huruf[j] > kunci) {
                huruf[j + 1] = huruf[j];
                j--;
            }
            huruf[j + 1] = kunci;
        }
        System.out.println("Huruf terurut: " + new String(huruf));
        int[] sudahUrut = {1, 2, 3, 4};
        int perbandingan = 0;
        for (int i = 1; i < sudahUrut.length; i++) {
            int kunci = sudahUrut[i];
            int j = i - 1;
            while (j >= 0) {
                perbandingan++;
                if (sudahUrut[j] <= kunci) {
                    break;
                }
                sudahUrut[j + 1] = sudahUrut[j];
                j--;
            }
            sudahUrut[j + 1] = kunci;
        }
        System.out.println("Perbandingan pada data terurut: " + perbandingan);
    }
}
