// Error: toString di-override dengan tipe kembalian int (toString() in Skor cannot override toString() in Object)
public class Main {
    public static void main(String[] args) {
        Skor s = new Skor(90);
        System.out.println(s);
    }
}

class Skor {
    int nilai;

    Skor(int nilai) {
        this.nilai = nilai;
    }

    public int toString() {
        return nilai;
    }
}
