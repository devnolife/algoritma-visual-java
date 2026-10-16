// Error: mengurangkan int dari String (bad operand types for binary operator '-')
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        String stok = "10";
        int sisa = stok - 1;
        System.out.println(sisa);
    }
}
