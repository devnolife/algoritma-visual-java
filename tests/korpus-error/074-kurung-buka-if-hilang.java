// Error: kurung buka kondisi if lupa ditulis ('(' expected)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int nilai = 8;
        if nilai > 5) {
            System.out.println("besar");
        }
    }
}
