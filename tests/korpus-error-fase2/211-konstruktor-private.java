// Error: objek dibuat lewat konstruktor private dari kelas lain (Konfigurasi() has private access in Konfigurasi)
public class Main {
    public static void main(String[] args) {
        Konfigurasi k = new Konfigurasi();
        System.out.println(k.mode);
    }
}

class Konfigurasi {
    String mode = "uji";

    private Konfigurasi() {
    }

    static Konfigurasi buat() {
        return new Konfigurasi();
    }
}
