// Error: memanggil method void di dalam println ('void' type not allowed here)
public class Main {
    static void sapa(String nama) {
        System.out.println("Halo, " + nama);
    }

    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        System.out.println(sapa("Rina"));
    }
}
