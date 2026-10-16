// Error: kondisi while berupa String (incompatible types: String cannot be converted to boolean)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        String lanjut = "ya";
        int putaran = 0;
        while (lanjut) {
            putaran++;
            lanjut = "tidak";
        }
        System.out.println(putaran);
    }
}
