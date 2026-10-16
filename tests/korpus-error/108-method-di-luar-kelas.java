// Error: method ditulis setelah kurung kurawal penutup kelas (javac 21: unnamed classes are a preview feature)
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        System.out.println("Program dobel");
    }
}

static int dobel(int x) {
    return x * 2;
}
