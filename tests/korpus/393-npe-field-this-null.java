// NPE di method instance saat field milik objek ini masih null: pesan menyebut "this.kepala" walaupun kode menulis kepala tanpa this
public class Main {
    static class Antrian {
        String nama;
        Simpul kepala;
        int panjang;

        Antrian(String nama) {
            this.nama = nama;
        }

        class Simpul {
            String isi;
            Simpul berikut;

            Simpul(String isi) {
                this.isi = isi;
            }
        }

        void tambah(String isi) {
            Simpul s = new Simpul(isi);
            s.berikut = kepala;
            kepala = s;
            panjang++;
        }

        String intip() {
            return kepala.isi;
        }

        String intipKedua() {
            return this.kepala.berikut.isi;
        }
    }

    public static void main(String[] args) {
        Antrian a = new Antrian("loket");
        a.tambah("Ani");
        System.out.println("intip " + a.intip());
        try {
            System.out.println("intip kedua " + a.intipKedua());
        } catch (NullPointerException e) {
            System.out.println("intipKedua: " + e.getMessage());
        }
        a.tambah("Budi");
        System.out.println("intip kedua sekarang " + a.intipKedua());
        Antrian b = new Antrian("kosong");
        System.out.println("antrian " + b.nama + " panjang " + b.panjang);
        System.out.println("intip " + b.intip());
    }
}
