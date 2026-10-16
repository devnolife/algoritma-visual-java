// Error: literal 3.14 (double) disimpan ke float (possible lossy conversion from double to float)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        float pi = 3.14;
        float r = 2f;
        System.out.println(pi * r * r);
    }
}
