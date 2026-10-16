// Error: argumen konstruktor tertukar urutannya; hanya satu kandidat sehingga javac memakai pesan ringkas (incompatible types: int cannot be converted to String)
public class Main {
    public static void main(String[] args) {
        Mahasiswa m = new Mahasiswa(2023001, "Rina");
        System.out.println(m.nama);
    }
}

class Mahasiswa {
    String nama;
    int nim;

    Mahasiswa(String nama, int nim) {
        this.nama = nama;
        this.nim = nim;
    }
}
