// Error: Math.round(double) menghasilkan long lalu disimpan ke int (possible lossy conversion from long to int)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        double nilai = 79.5;
        int dibulatkan = Math.round(nilai);
        System.out.println(dibulatkan);
    }
}
