// Error: field instance dibaca lewat nama kelas, bukan lewat objek (non-static variable nama cannot be referenced from a static context)
public class Main {
    public static void main(String[] args) {
        Mahasiswa m = new Mahasiswa("Rina");
        System.out.println("Nama: " + m.nama);
        System.out.println("Nama lagi: " + Mahasiswa.nama);
    }
}

class Mahasiswa {
    String nama;

    Mahasiswa(String nama) {
        this.nama = nama;
    }
}
