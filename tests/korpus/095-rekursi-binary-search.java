// Binary search rekursif dengan jejak rentang pencarian
public class Main {
    static int langkah = 0;

    static int cari(int[] data, int target, int kiri, int kanan) {
        langkah++;
        if (kiri > kanan) {
            System.out.println("  rentang kosong, berhenti");
            return -1;
        }
        int tengah = (kiri + kanan) / 2;
        System.out.println("  kiri=" + kiri + " kanan=" + kanan + " tengah=" + tengah + " (" + data[tengah] + ")");
        if (data[tengah] == target) {
            return tengah;
        } else if (data[tengah] < target) {
            return cari(data, target, tengah + 1, kanan);
        } else {
            return cari(data, target, kiri, tengah - 1);
        }
    }

    public static void main(String[] args) {
        int[] data = {2, 5, 8, 12, 16, 23, 38, 56, 72, 91};
        int[] target = {23, 2, 91, 50};
        for (int t : target) {
            langkah = 0;
            System.out.println("Cari " + t + ":");
            int hasil = cari(data, t, 0, data.length - 1);
            System.out.println("=> indeks " + hasil + " dalam " + langkah + " pemanggilan");
        }
    }
}
