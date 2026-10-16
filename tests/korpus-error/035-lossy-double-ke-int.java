// Error: hasil pembagian double disimpan ke int (possible lossy conversion from double to int)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        int total = 175;
        int rata = total / 2.0;
        System.out.println(rata);
    }
}
