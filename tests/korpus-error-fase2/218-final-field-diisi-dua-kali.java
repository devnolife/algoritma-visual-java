// Error: field final mungkin diisi dua kali di konstruktor (variable nim might already have been assigned)
public class Main {
    public static void main(String[] args) {
        Mahasiswa m = new Mahasiswa("H071");
        System.out.println(m.nim);
    }
}

class Mahasiswa {
    final String nim;

    Mahasiswa(String nim) {
        this.nim = nim;
        if (nim.isEmpty()) {
            this.nim = "TANPA-NIM";
        }
    }
}
