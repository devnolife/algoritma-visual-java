// Error: ruas kanan penugasan kosong (illegal start of expression)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int a = 10;
        int b = ;
        System.out.println(a + b);
    }
}
