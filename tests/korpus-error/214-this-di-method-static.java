// Error: this dipakai di dalam method static (non-static variable this cannot be referenced from a static context)
public class Main {
    String nama = "Kalkulator";

    static void cetakNama() {
        System.out.println(this.nama);
    }

    public static void main(String[] args) {
        cetakNama();
    }
}
