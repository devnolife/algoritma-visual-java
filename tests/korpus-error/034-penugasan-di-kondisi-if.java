// Error: memakai = alih-alih == di kondisi if (incompatible types: int cannot be converted to boolean)
public class Main {
    static int hitungBaris = 0;

    static void catat(String pesan) {
        hitungBaris++;
        System.out.println(hitungBaris + ". " + pesan);
    }

    public static void main(String[] args) {
        catat("Program dimulai");
        int x = 5;
        if (x = 5) {
            System.out.println("x bernilai lima");
        }
    }
}
