// Exception unchecked buatan sebagai kelas bersarang Main: tidak wajib throws, dan bila tidak ditangkap namanya tercetak Main$StokHabisException
public class Main {
    static class StokHabisException extends RuntimeException {
        StokHabisException(String pesan) {
            super(pesan);
        }
    }

    static int[] stok = {3, 1, 0};
    static String[] nama = {"pensil", "penghapus", "penggaris"};

    static void jual(int i, int jumlah) {
        if (stok[i] < jumlah) {
            throw new StokHabisException(nama[i] + " tersisa " + stok[i] + ", diminta " + jumlah);
        }
        stok[i] -= jumlah;
        System.out.println("terjual " + jumlah + " " + nama[i] + ", sisa " + stok[i]);
    }

    static void layani(int[][] pesanan) {
        for (int[] p : pesanan) {
            jual(p[0], p[1]);
        }
    }

    public static void main(String[] args) {
        try {
            jual(2, 1);
        } catch (StokHabisException e) {
            System.out.println("tertangkap: " + e);
        }
        layani(new int[][] {{0, 2}, {1, 1}, {0, 1}, {1, 1}, {0, 5}});
        System.out.println("tidak tercetak");
    }
}
