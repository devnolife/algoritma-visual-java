// Error: konstruktor tidak mengisi field final (variable kode might not have been initialized)
public class Main {
    public static void main(String[] args) {
        Matkul m = new Matkul("Algoritma");
        System.out.println(m.nama);
    }
}

class Matkul {
    final String kode;
    String nama;

    Matkul(String nama) {
        this.nama = nama;
    }
}
