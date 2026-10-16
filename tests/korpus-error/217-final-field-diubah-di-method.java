// Error: field final diubah di dalam method (cannot assign a value to final variable kapasitas)
public class Main {
    public static void main(String[] args) {
        Ruang r = new Ruang(30);
        r.perbesar(10);
        System.out.println(r.kapasitas);
    }
}

class Ruang {
    final int kapasitas;

    Ruang(int kapasitas) {
        this.kapasitas = kapasitas;
    }

    void perbesar(int tambahan) {
        kapasitas = kapasitas + tambahan;
    }
}
