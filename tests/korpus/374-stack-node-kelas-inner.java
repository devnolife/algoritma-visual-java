// Stack berbasis node dengan kelas inner (non-static) Simpul yang dibuat dari method instance; tiap stack menghitung operasinya sendiri
public class Main {
    public static void main(String[] args) {
        TumpukanBuku meja = new TumpukanBuku("meja");
        TumpukanBuku rak = new TumpukanBuku("rak");
        meja.taruh("Kalkulus");
        meja.taruh("Fisika");
        rak.taruh("Novel");
        meja.taruh("Algoritma");
        meja.cetak();
        rak.cetak();
        System.out.println("ambil dari meja: " + meja.ambil());
        rak.taruh(meja.ambil());
        meja.cetak();
        rak.cetak();
        System.out.println("operasi meja " + meja.operasi + ", rak " + rak.operasi);
        System.out.println("ambil dari meja: " + meja.ambil() + ", lalu " + meja.ambil());
    }
}

class TumpukanBuku {
    String nama;
    Simpul puncak;
    int operasi;

    TumpukanBuku(String nama) {
        this.nama = nama;
    }

    class Simpul {
        String judul;
        Simpul bawah;

        Simpul(String judul, Simpul bawah) {
            this.judul = judul;
            this.bawah = bawah;
            operasi++;
        }
    }

    void taruh(String judul) {
        puncak = new Simpul(judul, puncak);
    }

    String ambil() {
        if (puncak == null) {
            return "(kosong di " + nama + ")";
        }
        operasi++;
        String j = puncak.judul;
        puncak = puncak.bawah;
        return j;
    }

    void cetak() {
        StringBuilder sb = new StringBuilder(nama + ": ");
        for (Simpul s = puncak; s != null; s = s.bawah) {
            sb.append('[').append(s.judul).append(']');
        }
        System.out.println(sb);
    }
}
