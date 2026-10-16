// Error: konstanta 200 di luar jangkauan byte (possible lossy conversion from int to byte)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        byte kecil = 100;
        byte besar = 200;
        System.out.println(kecil + besar);
    }
}
