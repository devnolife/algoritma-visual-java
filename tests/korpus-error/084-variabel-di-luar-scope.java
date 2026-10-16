// Error: variabel loop dipakai di luar for (cannot find symbol: variable i)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int[] data = {2, 4, 6, 8};
        for (int i = 0; i < data.length; i++) {
            if (data[i] == 6) {
                break;
            }
        }
        System.out.println("Ditemukan di indeks " + i);
    }
}
