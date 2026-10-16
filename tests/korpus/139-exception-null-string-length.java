// NullPointerException: memanggil length() pada elemen String null (pesan NPE bernama variabel)
public class Main {
    public static void main(String[] args) {
        String[] nama = new String[3];
        nama[0] = "Andi";
        nama[2] = "Citra";
        System.out.println("Isi array: " + nama[0] + ", " + nama[1] + ", " + nama[2]);
        String kosong = null;
        System.out.println("Konkatenasi null aman: " + kosong + "!");
        System.out.println("nama[1] == null? " + (nama[1] == null));
        for (int i = 0; i < nama.length; i++) {
            String n = nama[i];
            System.out.println(n + " panjang " + n.length());
        }
    }
}
