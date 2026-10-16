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
        for (int i = 0; i < n - 1; i++) {
            int idxMin = i;   // #anggap
            for (int j = i + 1; j < n; j++) {
                perbandingan++;
                if (data[j] < data[idxMin]) {   // #banding
                    idxMin = j;
                }
            }
            int sementara = data[i];   // #tukar
            data[i] = data[idxMin];
            data[idxMin] = sementara;
            System.out.println("Putaran " + (i + 1) + ": " + Arrays.toString(data));
        }
        System.out.println("Terurut: " + Arrays.toString(data));
        System.out.println("Perbandingan: " + perbandingan);
    }
}
