// Error: konstruktor dipanggil dengan argumen kurang (constructor Titik in class Titik cannot be applied to given types;)
public class Main {
    public static void main(String[] args) {
        Titik a = new Titik(3, 4);
        Titik b = new Titik(7);
        System.out.println(a.x + b.y);
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
