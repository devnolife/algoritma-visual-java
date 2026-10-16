// Saldo private hanya berubah lewat setor/tarik/transfer yang memeriksa aturan; riwayat transaksi disimpan di ArrayList
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        Akun ani = new Akun("Ani", 100000);
        Akun budi = new Akun("Budi", 20000);
        ani.setor(50000);
        ani.tarik(500000);
        ani.tarik(30000);
        budi.setor(-100);
        ani.transfer(budi, 70000);
        budi.transfer(ani, 100000);
        budi.tarik(90000);
        System.out.println(ani.ringkasan());
        System.out.println(budi.ringkasan());
        System.out.println("Riwayat Ani:");
        for (String r : ani.getRiwayat()) {
            System.out.println("  " + r);
        }
        System.out.println("Riwayat Budi: " + budi.getRiwayat());
    }
}

class Akun {
    private final String pemilik;
    private long saldo;
    private final ArrayList<String> riwayat = new ArrayList<>();
    private static final long MINIMUM = 10000;

    Akun(String pemilik, long saldoAwal) {
        this.pemilik = pemilik;
        this.saldo = saldoAwal;
        catat("buka", saldoAwal);
    }

    private void catat(String jenis, long jumlah) {
        riwayat.add(jenis + " " + jumlah + " -> " + saldo);
    }

    boolean setor(long jumlah) {
        if (jumlah <= 0) {
            System.out.println(pemilik + ": setoran harus positif");
            return false;
        }
        saldo += jumlah;
        catat("setor", jumlah);
        return true;
    }

    boolean tarik(long jumlah) {
        if (saldo - jumlah < MINIMUM) {
            System.out.println(pemilik + ": tarik " + jumlah + " ditolak, saldo " + saldo);
            return false;
        }
        saldo -= jumlah;
        catat("tarik", jumlah);
        return true;
    }

    boolean transfer(Akun tujuan, long jumlah) {
        if (!tarik(jumlah)) {
            return false;
        }
        tujuan.saldo += jumlah;
        tujuan.catat("terima dari " + pemilik, jumlah);
        return true;
    }

    ArrayList<String> getRiwayat() {
        return new ArrayList<>(riwayat);
    }

    String ringkasan() {
        return pemilik + ": saldo " + saldo + ", " + riwayat.size() + " transaksi";
    }
}
