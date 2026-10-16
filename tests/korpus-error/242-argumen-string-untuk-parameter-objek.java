// Error: String dikirim ke method yang menerima objek Titik (incompatible types: String cannot be converted to Titik)
public class Main {
    static class Titik {
        int x;
        int y;
    }

    static double jarakDariNol(Titik t) {
        return Math.sqrt(t.x * t.x + t.y * t.y);
    }

    public static void main(String[] args) {
        Titik t = new Titik();
        t.x = 3;
        t.y = 4;
        System.out.println(jarakDariNol(t));
        System.out.println(jarakDariNol("3,4"));
    }
}
