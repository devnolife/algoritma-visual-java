// Error: hasil Math.pow (double) disimpan ke long (possible lossy conversion from double to long)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        int eksponen = 10;
        long hasil = Math.pow(2, eksponen);
        System.out.println(hasil);
    }
}
