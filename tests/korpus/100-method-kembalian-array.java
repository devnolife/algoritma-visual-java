// Method yang mengembalikan array, boolean, dan pemanggilan berantai
import java.util.Arrays;

public class Main {
    static int[] kuadrat(int[] data) {
        int[] hasil = new int[data.length];
        for (int i = 0; i < data.length; i++) {
            hasil[i] = data[i] * data[i];
        }
        return hasil;
    }

    static int[] rentang(int awal, int akhir) {
        int[] hasil = new int[Math.max(0, akhir - awal)];
        for (int i = 0; i < hasil.length; i++) {
            hasil[i] = awal + i;
        }
        return hasil;
    }

    static boolean genap(int n) {
        return n % 2 == 0;
    }

    static int[] saringGenap(int[] data) {
        int jumlah = 0;
        for (int d : data) {
            if (genap(d)) {
                jumlah++;
            }
        }
        int[] hasil = new int[jumlah];
        int j = 0;
        for (int d : data) {
            if (genap(d)) {
                hasil[j++] = d;
            }
        }
        return hasil;
    }

    static int tambah(int a, int b) {
        return a + b;
    }

    static int kali(int a, int b) {
        return a * b;
    }

    public static void main(String[] args) {
        int[] r = rentang(1, 8);
        System.out.println("rentang(1, 8) = " + Arrays.toString(r));
        System.out.println("kuadrat = " + Arrays.toString(kuadrat(r)));
        System.out.println("genap dari kuadrat = " + Arrays.toString(saringGenap(kuadrat(r))));
        System.out.println("rentang(5, 2) = " + Arrays.toString(rentang(5, 2)));
        System.out.println("tambah(kali(2, 3), kali(4, 5)) = " + tambah(kali(2, 3), kali(4, 5)));
        System.out.println("kuadrat(rentang(2, 4))[1] = " + kuadrat(rentang(2, 4))[1]);
        System.out.println("rentang(0, 3).length = " + rentang(0, 3).length);
        System.out.println(genap(10) && !genap(7) ? "logika benar" : "logika salah");
    }
}
