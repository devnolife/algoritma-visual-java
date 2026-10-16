// Error: deklarasi variabel sebagai badan if tanpa kurung kurawal (variable declaration not allowed here)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int x = 4;
        if (x > 0)
            int kuadrat = x * x;
        System.out.println(x);
    }
}
