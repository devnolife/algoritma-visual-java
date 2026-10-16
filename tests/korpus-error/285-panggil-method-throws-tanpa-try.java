// Error: memanggil method yang mendeklarasikan throws exception checked buatan tanpa try-catch (unreported exception SaldoKurangException; must be caught or declared to be thrown)
public class Main {
    static int saldo = 50000;

    static void tarik(int jumlah) throws SaldoKurangException {
        if (jumlah > saldo) {
            throw new SaldoKurangException("saldo kurang");
        }
        saldo -= jumlah;
    }

    public static void main(String[] args) {
        tarik(20000);
        System.out.println("sisa " + saldo);
    }
}

class SaldoKurangException extends Exception {
    SaldoKurangException(String pesan) {
        super(pesan);
    }
}
