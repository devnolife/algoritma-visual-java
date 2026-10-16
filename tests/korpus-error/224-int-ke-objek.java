// Error: angka disimpan ke variabel bertipe kelas buatan (incompatible types: int cannot be converted to Nilai)
public class Main {
    public static void main(String[] args) {
        Nilai n = 85;
        System.out.println(n.angka);
    }
}

class Nilai {
    int angka;
}
