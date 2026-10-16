// Error: field private dibaca dari kelas lain (saldo has private access in Akun)
public class Main {
    public static void main(String[] args) {
        Akun a = new Akun(5000);
        System.out.println("Saldo: " + a.saldo);
    }
}

class Akun {
    private int saldo;

    Akun(int saldo) {
        this.saldo = saldo;
    }

    int getSaldo() {
        return saldo;
    }
}
