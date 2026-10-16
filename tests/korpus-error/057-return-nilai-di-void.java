// Error: method void mengembalikan nilai (incompatible types: unexpected return value)
public class Main {
    static void tampilkan(int x) {
        System.out.println("Nilai: " + x);
        return x * 2;
    }

    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        tampilkan(4);
    }
}
