// Error: kelas yang dipakai sebagai tipe parameter belum pernah dibuat (cannot find symbol, symbol: class Mahasiswa)
public class Main {
    static class Dosen {
        String nama;
    }

    static void cetak(Mahasiswa m) {
        System.out.println(m);
    }

    public static void main(String[] args) {
        Dosen d = new Dosen();
        d.nama = "Pak Budi";
        System.out.println(d.nama);
    }
}
