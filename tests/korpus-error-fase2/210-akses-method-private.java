// Error: method private dipanggil dari kelas lain (hitungBunga(int) has private access in Tabungan)
public class Main {
    public static void main(String[] args) {
        Tabungan t = new Tabungan();
        t.setor(100000);
        System.out.println(t.hitungBunga(12));
    }
}

class Tabungan {
    private int saldo;

    void setor(int x) {
        saldo += x;
    }

    private int hitungBunga(int bulan) {
        return saldo * bulan / 100;
    }
}
