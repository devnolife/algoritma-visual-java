// Error: toString di-override tanpa public sehingga aksesnya lebih sempit (toString() in Titik cannot override toString() in Object)
public class Main {
    public static void main(String[] args) {
        Titik t = new Titik(2, 3);
        System.out.println(t);
    }
}

class Titik {
    int x;
    int y;

    Titik(int x, int y) {
        this.x = x;
        this.y = y;
    }

    String toString() {
        return "(" + x + ", " + y + ")";
    }
}
