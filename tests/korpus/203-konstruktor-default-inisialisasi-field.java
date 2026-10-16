// Konstruktor default implisit, inisialisasi field berurutan, lalu isi konstruktor berjalan setelah semua field terisi
public class Main {
    static int urutan = 0;

    static int catat(String nama, int nilai) {
        urutan++;
        System.out.println("  [" + urutan + "] inisialisasi " + nama + " = " + nilai);
        return nilai;
    }

    static class Lampu {
        boolean nyala;
        int watt = 10;
        String warna = "putih";
    }

    static class Kotak {
        int panjang = catat("panjang", 4);
        int lebar = catat("lebar", panjang + 1);
        int luas = catat("luas", panjang * lebar);

        Kotak() {
            System.out.println("  isi konstruktor Kotak(): luas saat ini " + luas);
            luas = luas * 2;
        }

        Kotak(int skala) {
            System.out.println("  isi konstruktor Kotak(int): skala " + skala);
            panjang *= skala;
            lebar *= skala;
            luas = panjang * lebar;
        }
    }

    public static void main(String[] args) {
        Lampu l = new Lampu();
        System.out.println("Lampu: nyala=" + l.nyala + ", watt=" + l.watt + ", warna=" + l.warna);
        System.out.println("Membuat Kotak()");
        Kotak k1 = new Kotak();
        System.out.println("k1: " + k1.panjang + " x " + k1.lebar + ", luas " + k1.luas);
        System.out.println("Membuat Kotak(3)");
        Kotak k2 = new Kotak(3);
        System.out.println("k2: " + k2.panjang + " x " + k2.lebar + ", luas " + k2.luas);
        System.out.println("Total inisialisasi field: " + urutan);
    }
}
