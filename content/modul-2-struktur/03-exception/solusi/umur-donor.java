class SaldoKurangException extends Exception {
    SaldoKurangException(String pesan) {
        super(pesan);
    }
}

class UmurTidakValidException extends Exception {
    UmurTidakValidException(String pesan) {
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

    static void daftarDonor(String nama, int umur) throws UmurTidakValidException {
        if (umur < 17 || umur > 60) {
            throw new UmurTidakValidException("umur " + umur + " di luar 17-60");
        }
        System.out.println(nama + " terdaftar");
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

        String[] nama = {"Rina", "Doni", "Sari"};
        int[] umur = {20, 15, 65};
        for (int i = 0; i < nama.length; i++) {
            try {
                daftarDonor(nama[i], umur[i]);
            } catch (UmurTidakValidException e) {
                System.out.println(nama[i] + " ditolak: " + e.getMessage());
            }
        }
    }
}
