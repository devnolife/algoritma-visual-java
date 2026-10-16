// Error: method bertipe kembalian objek mengembalikan angka (incompatible types: int cannot be converted to Titik)
public class Main {
    static class Titik {
        int x;
        int y;

        Titik(int x, int y) {
            this.x = x;
            this.y = y;
        }

        Titik geser(int dx) {
            int baru = x + dx;
            return baru;
        }
    }

    public static void main(String[] args) {
        Titik t = new Titik(1, 2).geser(3);
        System.out.println(t.x);
    }
}
