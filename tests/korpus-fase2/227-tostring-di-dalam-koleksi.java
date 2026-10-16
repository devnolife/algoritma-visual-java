// toString objek dipanggil oleh ArrayList.toString, HashMap.toString, dan Arrays.toString untuk array objek
import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;

public class Main {
    static class Barang {
        String nama;
        int stok;

        Barang(String nama, int stok) {
            this.nama = nama;
            this.stok = stok;
        }

        @Override
        public String toString() {
            return nama + "(" + stok + ")";
        }
    }

    public static void main(String[] args) {
        ArrayList<Barang> gudang = new ArrayList<>();
        gudang.add(new Barang("beras", 20));
        gudang.add(new Barang("gula", 5));
        gudang.add(null);
        gudang.add(new Barang("kopi", 12));
        System.out.println("gudang = " + gudang);
        Barang[] rak = {gudang.get(0), new Barang("teh", 7)};
        System.out.println("rak = " + Arrays.toString(rak));
        HashMap<String, Barang> indeks = new HashMap<>();
        indeks.put("B01", gudang.get(0));
        indeks.put("B02", gudang.get(1));
        indeks.put("B04", gudang.get(3));
        System.out.println("indeks = " + indeks);
        gudang.get(1).stok -= 3;
        System.out.println("setelah stok gula berkurang: " + indeks.get("B02") + " di " + gudang);
        ArrayList<ArrayList<Barang>> lorong = new ArrayList<>();
        lorong.add(new ArrayList<>());
        lorong.add(gudang);
        lorong.get(0).add(rak[1]);
        System.out.println("lorong = " + lorong);
        ArrayList<Object> campur = new ArrayList<>();
        campur.add(rak[1]);
        campur.add("teks");
        campur.add(42);
        campur.add('c');
        campur.add(3.5);
        campur.add(true);
        campur.add(null);
        System.out.println("campur = " + campur);
    }
}
