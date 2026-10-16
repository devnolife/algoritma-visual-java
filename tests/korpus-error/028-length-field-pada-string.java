// Error: memakai length tanpa kurung pada String (cannot find symbol: variable length)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        String kata = "algoritma";
        for (int i = 0; i < kata.length; i++) {
            System.out.println(kata.charAt(i));
        }
    }
}
