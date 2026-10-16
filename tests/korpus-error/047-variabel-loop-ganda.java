// Error: variabel loop dalam memakai nama i yang sama dengan loop luar (already defined)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        for (int i = 1; i <= 3; i++) {
            for (int i = 1; i <= 3; i++) {
                System.out.print(i * i + " ");
            }
            System.out.println();
        }
    }
}
