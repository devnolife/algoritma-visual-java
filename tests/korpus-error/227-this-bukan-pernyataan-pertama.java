// Error: this(...) dipanggil setelah pernyataan lain di konstruktor (call to this must be first statement in constructor)
public class Main {
    public static void main(String[] args) {
        Waktu w = new Waktu(90);
        System.out.println(w.jam + ":" + w.menit);
    }
}

class Waktu {
    int jam;
    int menit;

    Waktu(int jam, int menit) {
        this.jam = jam;
        this.menit = menit;
    }

    Waktu(int totalMenit) {
        System.out.println("konversi " + totalMenit);
        this(totalMenit / 60, totalMenit % 60);
    }
}
