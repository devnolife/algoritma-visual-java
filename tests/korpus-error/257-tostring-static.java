// Error: toString ditulis static sehingga tidak bisa meng-override method instance milik Object (toString() in Waktu cannot override toString() in Object)
public class Main {
    public static void main(String[] args) {
        Waktu w = new Waktu();
        System.out.println(w);
    }
}

class Waktu {
    static int jam = 9;

    public static String toString() {
        return "jam " + jam;
    }
}
