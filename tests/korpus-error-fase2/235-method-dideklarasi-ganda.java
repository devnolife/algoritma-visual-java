// Error: dua method dengan nama dan parameter sama di satu kelas walau tipe kembaliannya beda (method luas() is already defined in class Persegi)
public class Main {
    public static void main(String[] args) {
        Persegi p = new Persegi(4);
        System.out.println(p.luas());
    }
}

class Persegi {
    int sisi;

    Persegi(int sisi) {
        this.sisi = sisi;
    }

    int luas() {
        return sisi * sisi;
    }

    double luas() {
        return sisi * sisi * 1.0;
    }
}
