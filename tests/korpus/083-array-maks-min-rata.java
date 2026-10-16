// Maksimum, minimum, rata-rata, dan nilai terbesar kedua dari array nilai
public class Main {
    public static void main(String[] args) {
        int[] nilai = {78, 92, 65, 92, 88, 54, 71, 85};
        int maks = nilai[0];
        int min = nilai[0];
        int jumlah = 0;
        int idxMaks = 0;
        for (int i = 0; i < nilai.length; i++) {
            if (nilai[i] > maks) {
                maks = nilai[i];
                idxMaks = i;
            }
            if (nilai[i] < min) {
                min = nilai[i];
            }
            jumlah += nilai[i];
        }
        double rata = (double) jumlah / nilai.length;
        System.out.println("Maks = " + maks + " (indeks pertama " + idxMaks + ")");
        System.out.println("Min = " + min);
        System.out.println("Jumlah = " + jumlah);
        System.out.println("Rata-rata = " + rata);
        System.out.println("Rata-rata (int) = " + jumlah / nilai.length);
        int kedua = Integer.MIN_VALUE;
        for (int n : nilai) {
            if (n > kedua && n < maks) {
                kedua = n;
            }
        }
        System.out.println("Terbesar kedua (berbeda) = " + kedua);
        int pertama = Integer.MIN_VALUE, keduaBoleh = Integer.MIN_VALUE;
        for (int n : nilai) {
            if (n > pertama) {
                keduaBoleh = pertama;
                pertama = n;
            } else if (n > keduaBoleh) {
                keduaBoleh = n;
            }
        }
        System.out.println("Terbesar kedua (boleh sama) = " + keduaBoleh);
        int diAtasRata = 0;
        for (int n : nilai) {
            if (n > rata) {
                diAtasRata++;
            }
        }
        System.out.println("Di atas rata-rata: " + diAtasRata + " mahasiswa");
        double[] suhu = {-2.5, -7.25, 0.0, -1.0};
        double suhuMaks = Double.NEGATIVE_INFINITY;
        for (double s : suhu) {
            suhuMaks = Math.max(suhuMaks, s);
        }
        System.out.println("Suhu tertinggi = " + suhuMaks);
    }
}
