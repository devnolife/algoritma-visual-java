// Error: titik koma setelah if membuat else yatim ('else' without 'if')
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        int suhu = 35;
        if (suhu > 30); {
            System.out.println("Panas");
        } else {
            System.out.println("Sejuk");
        }
    }
}
