// Error: kurung kurawal penutup kelas hilang (reached end of file while parsing)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int total = 0;
        for (int i = 1; i <= 3; i++) {
            total += i;
        }
        System.out.println(total);
    }
