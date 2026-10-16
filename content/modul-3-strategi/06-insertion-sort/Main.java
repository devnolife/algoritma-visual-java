import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int n = 7;
        boolean terurut = false;
        int[] data = new int[n];
        for (int k = 0; k < n; k++) {
            data[k] = terurut ? k + 1 : (k * 37 + 11) % 50 + 1;
        }
        int perbandingan = 0;
        for (int i = 1; i < n; i++) {
            int kunci = data[i];   // #ambil
            int j = i - 1;
            while (j >= 0) {
                perbandingan++;
                if (data[j] <= kunci) {   // #banding
                    break;
                }
                data[j + 1] = data[j];
                j--;
            }
            data[j + 1] = kunci;   // #sisip
        }
        System.out.println("Terurut: " + Arrays.toString(data));
        System.out.println("Perbandingan: " + perbandingan);
    }
}
