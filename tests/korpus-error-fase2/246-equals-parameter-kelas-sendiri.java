// Error: equals dengan parameter bertipe kelas sendiri diberi @Override, padahal equals milik Object menerima Object (method does not override or implement a method from a supertype)
public class Main {
    static class Titik {
        int x;
        int y;

        Titik(int x, int y) {
            this.x = x;
            this.y = y;
        }

        @Override
        public boolean equals(Titik lain) {
            return x == lain.x && y == lain.y;
        }
    }

    public static void main(String[] args) {
        System.out.println(new Titik(1, 2).equals(new Titik(1, 2)));
    }
}
