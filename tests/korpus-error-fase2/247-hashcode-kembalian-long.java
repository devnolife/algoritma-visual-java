// Error: hashCode di-override dengan tipe kembalian long (hashCode() in Kode cannot override hashCode() in Object)
public class Main {
    public static void main(String[] args) {
        Kode k = new Kode("IF101");
        System.out.println(k.hashCode());
    }
}

class Kode {
    String teks;

    Kode(String teks) {
        this.teks = teks;
    }

    public long hashCode() {
        return teks.hashCode() * 31L;
    }
}
