// Error: kelas inner dibuat dari kelas lain tanpa objek kelas luarnya (an enclosing instance that contains Main.Kamar is required)
public class Main {
    String namaHotel = "Melati";

    class Kamar {
        int nomor;
    }

    public static void main(String[] args) {
        Resepsionis.pesan();
    }
}

class Resepsionis {
    static void pesan() {
        Object k = new Main.Kamar();
        System.out.println(k != null);
    }
}
