// ArrayIndexOutOfBoundsException saat membaca indeks = length (kesalahan <= pada loop)
public class Main {
    public static void main(String[] args) {
        int[] nilai = {70, 80, 90, 60, 75};
        System.out.println("Banyak nilai: " + nilai.length);
        System.out.println("Indeks terakhir yang sah: " + (nilai.length - 1));
        int total = 0;
        for (int i = 0; i <= nilai.length; i++) {
            System.out.println("nilai[" + i + "] = " + nilai[i]);
            total += nilai[i];
        }
        System.out.println("Total: " + total);
        System.out.println("Rata-rata: " + total / nilai.length);
    }
}
