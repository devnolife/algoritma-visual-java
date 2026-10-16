// NPE saat menulis field lewat referensi null: pesan "Cannot assign field" menyebut ekspresi yang null (lokal, elemen array, rantai field)
public class Main {
    static class Kotak {
        int isi;
        Kotak dalam;
    }

    public static void main(String[] args) {
        Kotak luar = new Kotak();
        luar.isi = 5;
        System.out.println("luar.isi = " + luar.isi + ", luar.dalam = " + luar.dalam);
        Kotak kosong = null;
        try {
            kosong.isi = 1;
        } catch (NullPointerException e) {
            System.out.println("1: " + e.getMessage());
        }
        Kotak[] rak = new Kotak[3];
        rak[0] = luar;
        try {
            rak[2].isi = 9;
        } catch (NullPointerException e) {
            System.out.println("2: " + e.getMessage());
        }
        luar.dalam = new Kotak();
        luar.dalam.isi = 7;
        System.out.println("luar.dalam.isi = " + luar.dalam.isi);
        luar.dalam.dalam.isi = 8;
    }
}
