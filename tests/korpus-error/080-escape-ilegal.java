// Error: garis miring terbalik tunggal di path Windows (illegal escape character)
public class Main {
    static boolean siapBelajar() {
        int jam = 8;
        return jam >= 7 && jam <= 17;
    }

    public static void main(String[] args) {
        System.out.println("Siap belajar? " + siapBelajar());
        System.out.println("Mulai");
        System.out.println("-".repeat(20));
        String lokasi = "C:\data\nilai.txt";
        System.out.println(lokasi);
    }
}
