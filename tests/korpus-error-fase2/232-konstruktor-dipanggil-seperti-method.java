// Error: konstruktor dipanggil seperti method pada objek yang sudah ada (cannot find symbol, symbol: method Titik(int,int))
public class Main {
    public static void main(String[] args) {
        Titik t = new Titik(0, 0);
        t.Titik(3, 4);
        System.out.println(t.x);
    }
}

class Titik {
    int x;
    int y;

    Titik(int x, int y) {
        this.x = x;
        this.y = y;
    }
}
