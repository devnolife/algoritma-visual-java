// Error: memberi nilai double ke String (incompatible types: double cannot be converted to String)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        double harga = 2500.5;
        String teksHarga = harga * 2;
        System.out.println(teksHarga);
    }
}
