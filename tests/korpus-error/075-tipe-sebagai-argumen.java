// Error: menulis nama tipe sebagai argumen pemanggilan method ('.class' expected)
public class Main {
    static int kuadrat(int n) {
        return n * n;
    }

    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        int x = 3;
        System.out.println(kuadrat(int));
    }
}
