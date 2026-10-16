// Error: operator ! pada String (bad operand type String for unary operator '!')
public class Main {
    static void cetakInfo(String nama, int versi) {
        System.out.println("Nama program : " + nama);
        System.out.println("Versi        : " + versi);
        System.out.println();
    }

    public static void main(String[] args) {
        cetakInfo("Latihan " + 1, 2);
        String nama = "";
        if (!nama) {
            System.out.println("nama kosong");
        }
    }
}
