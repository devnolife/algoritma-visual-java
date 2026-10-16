// Method instance mengubah state objek: mesin minuman dengan stok, kredit, pendapatan, dan jumlah transaksi
public class Main {
    public static void main(String[] args) {
        MesinMinuman m = new MesinMinuman(3, 5000);
        m.status();
        m.masukkanUang(2000);
        m.beli();
        m.masukkanUang(5000);
        m.beli();
        m.status();
        m.masukkanUang(10000);
        m.beli();
        m.beli();
        m.beli();
        m.status();
        m.isiUlang(2);
        m.beli();
        m.status();
        System.out.println("Kembalian diambil: " + m.ambilKembalian());
        m.status();
    }
}

class MesinMinuman {
    int stok;
    int harga;
    int kredit;
    int pendapatan;
    int transaksi;

    MesinMinuman(int stok, int harga) {
        this.stok = stok;
        this.harga = harga;
    }

    void masukkanUang(int jumlah) {
        kredit += jumlah;
        System.out.println("Masuk " + jumlah + ", kredit " + kredit);
    }

    void beli() {
        if (stok == 0) {
            System.out.println("Gagal: stok habis");
        } else if (kredit < harga) {
            System.out.println("Gagal: kredit " + kredit + " kurang dari " + harga);
        } else {
            stok--;
            kredit -= harga;
            pendapatan += harga;
            transaksi++;
            System.out.println("Berhasil membeli, sisa stok " + stok + ", sisa kredit " + kredit);
        }
    }

    void isiUlang(int jumlah) {
        stok += jumlah;
        System.out.println("Isi ulang " + jumlah + ", stok " + stok);
    }

    int ambilKembalian() {
        int k = kredit;
        kredit = 0;
        return k;
    }

    void status() {
        System.out.println("[stok=" + stok + ", kredit=" + kredit + ", pendapatan=" + pendapatan + ", transaksi=" + transaksi + "]");
    }
}
