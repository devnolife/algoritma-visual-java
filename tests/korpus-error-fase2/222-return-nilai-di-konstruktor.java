// Error: konstruktor mengembalikan nilai dengan return (incompatible types: unexpected return value)
public class Main {
    public static void main(String[] args) {
        Kotak k = new Kotak(3);
        System.out.println(k.sisi);
    }
}

class Kotak {
    int sisi;

    Kotak(int sisi) {
        this.sisi = sisi;
        return this;
    }
}
