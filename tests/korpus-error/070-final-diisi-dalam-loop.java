// Error: variabel final diisi di dalam loop (variable terakhir might be assigned in loop)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        final int terakhir;
        for (int i = 0; i < 3; i++) {
            terakhir = i;
        }
        System.out.println("selesai");
    }
}
