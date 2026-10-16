// Error: variabel objek dipakai sebelum pasti diisi (variable p might not have been initialized)
public class Main {
    static class Pesanan {
        int jumlah;
    }

    public static void main(String[] args) {
        Pesanan p;
        boolean ada = args.length > 5;
        if (ada) {
            p = new Pesanan();
        }
        p.jumlah = 3;
        System.out.println(p.jumlah);
    }
}
