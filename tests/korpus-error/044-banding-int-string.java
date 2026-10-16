// Error: membandingkan int dengan String memakai ==
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int angka = 5;
        if (angka == "5") {
            System.out.println("sama");
        }
    }
}
