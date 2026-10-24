class SaldoKurangException extends Exception {
    SaldoKurangException(String pesan) {
        super(pesan);
    }
}

class Dompet {
    private int saldo;

    Dompet(int saldo) {
        this.saldo = saldo;
    }

    void bayar(int harga) throws SaldoKurangException {
        if (harga <= 0) {
            throw new IllegalArgumentException("harga harus positif: " + harga);
        }
        if (harga > saldo) {
            throw new SaldoKurangException("saldo " + saldo + ", kurang " + (harga - saldo));   // #lempar
        }
        saldo -= harga;
    }
}

public class Main {
    static void belanja(Dompet dompet, int[] keranjang) throws SaldoKurangException {
        for (int harga : keranjang) {
            dompet.bayar(harga);
            System.out.println("Bayar " + harga + " berhasil");
        }
        System.out.println("Semua lunas");
    }

    public static void main(String[] args) {
        Dompet dompet = new Dompet(20000);
        int[] keranjang = {8000, 5000, 9000, 2000};
        try {
            belanja(dompet, keranjang);
        } catch (SaldoKurangException e) {   // #tangkap
            System.out.println("Gagal: " + e.getMessage());
            e.printStackTrace();
        } finally {
            System.out.println("Struk dicetak");   // #akhirnya
        }
        System.out.println("Program selesai");
    }
}
