// Scanner: membaca jumlah data n lalu n bilangan, menghitung maks, min, rata-rata
import java.util.*;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        System.out.print("Banyak data: ");
        int n = sc.nextInt();
        int[] data = new int[n];
        for (int i = 0; i < n; i++) {
            System.out.print("Data ke-" + (i + 1) + ": ");
            data[i] = sc.nextInt();
        }
        System.out.println();
        int maks = data[0], min = data[0];
        long total = 0;
        for (int d : data) {
            maks = Math.max(maks, d);
            min = Math.min(min, d);
            total += d;
        }
        System.out.println("Data     : " + Arrays.toString(data));
        System.out.println("Maks     : " + maks);
        System.out.println("Min      : " + min);
        System.out.println("Total    : " + total);
        System.out.printf("Rata-rata: %.2f%n", (double) total / n);
    }
}
