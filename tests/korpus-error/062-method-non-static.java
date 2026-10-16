// Error: memanggil method tanpa static dari main (non-static method sapa() cannot be referenced from a static context)
public class Main {
    void sapa() {
        System.out.println("Halo!");
    }

    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        sapa();
    }
}
