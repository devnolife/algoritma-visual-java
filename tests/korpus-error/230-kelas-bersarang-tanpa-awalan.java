// Error: kelas bersarang milik Main dipakai dari kelas top-level lain tanpa awalan Main. (cannot find symbol, symbol: class Simpul)
public class Main {
    static class Simpul {
        int data;
    }

    public static void main(String[] args) {
        Daftar d = new Daftar();
        d.tambah(5);
    }
}

class Daftar {
    Simpul kepala;

    void tambah(int x) {
        kepala = new Main.Simpul();
        kepala.data = x;
    }
}
