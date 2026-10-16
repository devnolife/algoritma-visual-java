// Error: new tanpa tanda kurung pemanggilan konstruktor ('(' or '[' expected)
public class Main {
    static class Kotak {
        int isi;
    }

    public static void main(String[] args) {
        Kotak k = new Kotak;
        k.isi = 4;
        System.out.println(k.isi);
    }
}
