import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        int n = 7;
        boolean terurut = false;   // true: data sudah terurut
        int[] data = new int[n];
        for (int i = 0; i < n; i++) {
            if (terurut) {
                data[i] = (i + 1) * 7;
            } else {
                data[i] = (i * 37 + 11) % 50 + 1;   // acak
            }
        }
        int perbandingan = 0;
        for (int putaran = 0; putaran < n - 1; putaran++) {
            int batas = n - 1 - putaran;   // #batas
            for (int j = 0; j < batas; j++) {
                perbandingan++;
                if (data[j] > data[j + 1]) {   // #banding
                    int sementara = data[j];   // #tukar
                    data[j] = data[j + 1];
                    data[j + 1] = sementara;
                }
            }
        }
        System.out.println(Arrays.toString(data));
        System.out.println("Perbandingan: " + perbandingan);
    }
}
