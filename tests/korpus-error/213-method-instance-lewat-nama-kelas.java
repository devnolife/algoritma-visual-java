// Error: method instance dipanggil lewat nama kelas (non-static method luas() cannot be referenced from a static context)
public class Main {
    public static void main(String[] args) {
        Lingkaran l = new Lingkaran(7);
        System.out.println(l.luas());
        System.out.println(Lingkaran.luas());
    }
}

class Lingkaran {
    double r;

    Lingkaran(double r) {
        this.r = r;
    }

    double luas() {
        return Math.PI * r * r;
    }
}
