// Math.round pada .5 dan bilangan negatif, floor, ceil, rint, signum
public class Main {
    public static void main(String[] args) {
        double[] data = {2.5, 3.5, -2.5, -2.6, -2.4, 0.5, -0.5, 1.4999, 2.0};
        for (double x : data) {
            System.out.println("x = " + x
                    + " | round = " + Math.round(x)
                    + " | floor = " + Math.floor(x)
                    + " | ceil = " + Math.ceil(x)
                    + " | rint = " + Math.rint(x));
        }
        System.out.println("round(2.5f)  = " + Math.round(2.5f));
        System.out.println("round(-1.5f) = " + Math.round(-1.5f));
        System.out.println("round(0.49999999999999994) = " + Math.round(0.49999999999999994));
        System.out.println("round(1e20)  = " + Math.round(1e20));
        System.out.println("round(NaN)   = " + Math.round(Double.NaN));
        System.out.println("ceil(-0.5)   = " + Math.ceil(-0.5));
        System.out.println("floor(-0.0)  = " + Math.floor(-0.0));
        System.out.println("signum(-7.5) = " + Math.signum(-7.5));
        System.out.println("signum(0.0)  = " + Math.signum(0.0));
        System.out.println("signum(3.0f) = " + Math.signum(3.0f));
        double harga = 12345.675;
        double dibulatkan = Math.round(harga * 100) / 100.0;
        System.out.println("Harga dibulatkan 2 desimal = " + dibulatkan);
        int nilaiAkhir = (int) Math.round(79.5);
        System.out.println("Nilai akhir 79.5 -> " + nilaiAkhir);
        long r = Math.round(7.0 / 2);
        System.out.println("round(7.0/2) = " + r);
        int halaman = (int) Math.ceil(23 / 10.0);
        System.out.println("Halaman untuk 23 data (10 per halaman) = " + halaman);
        int salah = (int) Math.ceil(23 / 10);
        System.out.println("Pakai pembagian int = " + salah);
        System.out.println("floor(7 / 2) = " + Math.floor(7 / 2));
        System.out.println("round(-0.5)  = " + Math.round(-0.5));
        System.out.println("round(-0.51) = " + Math.round(-0.51));
    }
}
