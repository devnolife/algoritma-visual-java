// ClassCastException saat Object di-cast ke kelas buatan yang salah; pesan JDK menyebut modul dan class loader
public class Main {
    static Object[] kandang = new Object[4];

    static void isiKandang() {
        kandang[0] = new Kucing("Tom");
        kandang[1] = new Anjing("Spike");
        kandang[2] = new Kucing("Garfield");
        kandang[3] = "bukan hewan";
    }

    public static void main(String[] args) {
        isiKandang();
        Kucing k0 = (Kucing) kandang[0];
        System.out.println("kandang 0: " + k0.suara());
        Object o = kandang[3];
        try {
            Anjing a = (Anjing) o;
            System.out.println(a.suara());
        } catch (ClassCastException e) {
            System.out.println("gagal: " + e.getMessage());
        }
        Object kosong = null;
        Kucing tidakAda = (Kucing) kosong;
        System.out.println("cast null aman: " + tidakAda);
        for (int i = 0; i < kandang.length; i++) {
            Kucing k = (Kucing) kandang[i];
            System.out.println("kandang " + i + ": " + k.suara());
        }
    }
}

class Kucing {
    String nama;

    Kucing(String nama) {
        this.nama = nama;
    }

    String suara() {
        return nama + " berkata meong";
    }
}

class Anjing {
    String nama;

    Anjing(String nama) {
        this.nama = nama;
    }

    String suara() {
        return nama + " berkata guk";
    }
}
