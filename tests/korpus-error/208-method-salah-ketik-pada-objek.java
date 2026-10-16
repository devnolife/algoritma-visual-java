// Error: memanggil method yang tidak ada pada objek (cannot find symbol, symbol: method tarikTunai(int))
public class Main {
    public static void main(String[] args) {
        Rekening r = new Rekening();
        r.setor(50000);
        r.tarikTunai(20000);
        System.out.println(r.saldo);
    }
}

class Rekening {
    int saldo;

    void setor(int x) {
        saldo += x;
    }

    void tarik(int x) {
        saldo -= x;
    }
}
