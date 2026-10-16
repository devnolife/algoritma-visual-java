// Statistik nilai: rata-rata, median, varians, simpangan baku dengan Math.sqrt dan printf
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        double[] nilai = {72.5, 88.0, 65.25, 90.0, 78.5, 55.0, 82.75, 70.0};
        double total = 0;
        for (double n : nilai) {
            total += n;
        }
        double rata = total / nilai.length;
        double[] urut = Arrays.copyOf(nilai, nilai.length);
        Arrays.sort(urut);
        double median;
        if (urut.length % 2 == 0) {
            median = (urut[urut.length / 2 - 1] + urut[urut.length / 2]) / 2;
        } else {
            median = urut[urut.length / 2];
        }
        double jumlahKuadrat = 0;
        for (double n : nilai) {
            jumlahKuadrat += (n - rata) * (n - rata);
        }
        double varians = jumlahKuadrat / (nilai.length - 1);
        double simpangan = Math.sqrt(varians);
        System.out.println("Data terurut : " + Arrays.toString(urut));
        System.out.println("Jumlah       : " + total);
        System.out.println("Rata-rata    : " + rata);
        System.out.println("Median       : " + median);
        System.out.println("Varians      : " + varians);
        System.out.printf("Simpangan baku: %.4f%n", simpangan);
        System.out.printf("Rentang      : %.2f - %.2f%n", urut[0], urut[urut.length - 1]);
        for (double n : nilai) {
            double z = (n - rata) / simpangan;
            System.out.printf("%6.2f -> z = %+.3f%n", n, z);
        }
    }
}
