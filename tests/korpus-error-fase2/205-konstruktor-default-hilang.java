// Error: konstruktor tanpa argumen dipanggil padahal kelas hanya punya konstruktor berparameter (constructor Akun in class Akun cannot be applied to given types;)
public class Main {
    public static void main(String[] args) {
        Akun a = new Akun();
        a.saldo = 1000;
        System.out.println(a.saldo);
    }
}

class Akun {
    int saldo;

    Akun(int saldoAwal) {
        saldo = saldoAwal;
    }
}
