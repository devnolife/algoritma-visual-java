// Error: mengakses karakter String dengan kurung siku (array required, but String found)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("-".repeat(20));
        String kata = "halo";
        char pertama = kata[0];
        System.out.println(pertama);
    }
}
