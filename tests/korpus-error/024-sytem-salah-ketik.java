// Error: salah ketik System menjadi Sytem (package Sytem does not exist)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("Mulai");
        System.out.println("-".repeat(20));
        int umur = 20;
        Sytem.out.println("Umur: " + umur);
    }
}
