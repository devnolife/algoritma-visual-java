// Error: membandingkan String dengan operator > (bad operand types for binary operator '>')
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        String nama = "Budi";
        if (nama > "M") {
            System.out.println("setelah M");
        }
    }
}
