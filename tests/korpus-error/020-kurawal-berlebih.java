// Error: kurung kurawal berlebih menutup kelas terlalu cepat (class, interface, enum, or record expected)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int x = 10;
        if (x > 5) {
            System.out.println("besar");
        }
    }
    }
}
