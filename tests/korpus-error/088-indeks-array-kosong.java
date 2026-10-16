// Error: akses array tanpa indeks di dalam kurung siku ('.class' expected)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int[] data = new int[3];
        data[0] = 7;
        System.out.println(data[]);
    }
}
