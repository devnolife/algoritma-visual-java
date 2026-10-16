// Error: objek disimpan ke variabel int (incompatible types: Titik cannot be converted to int)
public class Main {
    static class Titik {
        int x;
        int y;

        Titik(int x, int y) {
            this.x = x;
            this.y = y;
        }
    }

    public static void main(String[] args) {
        Titik t = new Titik(2, 5);
        int jarak = t;
        System.out.println(jarak);
    }
}
