// Error: konstruktor ditulis dengan tipe void sehingga menjadi method biasa (constructor Titik in class Titik cannot be applied to given types;)
public class Main {
    public static void main(String[] args) {
        Titik t = new Titik(3, 4);
        System.out.println(t.x + ", " + t.y);
    }
}

class Titik {
    int x;
    int y;

    void Titik(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
