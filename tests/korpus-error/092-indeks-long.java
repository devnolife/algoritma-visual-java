// Error: indeks array bertipe long (possible lossy conversion from long to int)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int[] data = {10, 20, 30};
        long posisi = 1;
        System.out.println(data[posisi]);
    }
}
