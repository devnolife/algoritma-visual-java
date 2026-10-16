// Error: variabel lokal dipakai sebelum diberi nilai (variable bonus might not have been initialized)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int gaji = 5000000;
        int bonus;
        int total = gaji + bonus;
        System.out.println("Total: " + total);
    }
}
