// Error: memakai Arrays tanpa import java.util.Arrays (cannot find symbol: variable Arrays)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int[] data = {5, 3, 9, 1};
        Arrays.sort(data);
        System.out.println(data[0]);
    }
}
