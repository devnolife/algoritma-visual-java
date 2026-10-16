// Konstruktor memvalidasi argumen dan melempar IllegalArgumentException (NumberFormatException ikut tertangkap); yang terakhir tidak ditangkap
public class Main {
    public static void main(String[] args) {
        String[][] data = {
            {"Kopi Toraja", "45000", "10"},
            {"Teh", "-2000", "5"},
            {"", "1000", "1"},
            {"Kecap", "dua ribu", "3"},
            {"Gula", "15000", "0"}
        };
        Barang[] gudang = new Barang[data.length];
        int berhasil = 0;
        for (String[] d : data) {
            try {
                gudang[berhasil] = new Barang(d[0], Integer.parseInt(d[1]), Integer.parseInt(d[2]));
                System.out.println("dibuat: " + gudang[berhasil].info());
                berhasil++;
            } catch (IllegalArgumentException e) {
                System.out.println("ditolak: " + e);
            }
        }
        System.out.println(berhasil + " barang valid, gudang[2] = " + gudang[2]);
        Barang rusak = new Barang("Garam", 3000, -4);
        System.out.println("tidak tercetak " + rusak.info());
    }
}

class Barang {
    private final String nama;
    private final int harga;
    private final int stok;

    Barang(String nama, int harga, int stok) {
        if (nama.isEmpty()) {
            throw new IllegalArgumentException("nama barang wajib diisi");
        }
        if (harga <= 0) {
            throw new IllegalArgumentException("harga " + nama + " harus positif: " + harga);
        }
        if (stok < 0) {
            throw new IllegalArgumentException("stok " + nama + " negatif: " + stok);
        }
        this.nama = nama;
        this.harga = harga;
        this.stok = stok;
    }

    String info() {
        return nama + " @" + harga + " x" + stok;
    }
}
