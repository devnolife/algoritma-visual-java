// Error: method int tidak mengembalikan nilai di semua jalur (missing return statement)
public class Main {
    static int maks(int a, int b) {
        if (a > b) {
            return a;
        } else if (b > a) {
            return b;
        }
    }

    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        System.out.println(maks(3, 7));
    }
}
