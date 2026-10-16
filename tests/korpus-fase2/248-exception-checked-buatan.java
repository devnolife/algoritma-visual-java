// Exception checked buatan sendiri (extends Exception): wajib dideklarasikan dengan throws dan ditangkap pemanggil
public class Main {
    static int saldo = 150000;

    static void tarik(int jumlah) throws SaldoTidakCukupException {
        if (jumlah > saldo) {
            throw new SaldoTidakCukupException("saldo " + saldo + " tidak cukup untuk menarik " + jumlah);
        }
        saldo -= jumlah;
        System.out.println("tarik " + jumlah + " berhasil, sisa " + saldo);
    }

    public static void main(String[] args) {
        int[] permintaan = {50000, 120000, 80000, 30000};
        for (int p : permintaan) {
            try {
                tarik(p);
            } catch (SaldoTidakCukupException e) {
                System.out.println("ditolak -> " + e.getMessage());
                System.out.println("toString -> " + e);
                System.out.println("kekurangan -> " + e.kekurangan(saldo, p));
            }
        }
        System.out.println("saldo akhir " + saldo);
    }
}

class SaldoTidakCukupException extends Exception {
    SaldoTidakCukupException(String pesan) {
        super(pesan);
    }

    int kekurangan(int saldo, int diminta) {
        return diminta - saldo;
    }
}
