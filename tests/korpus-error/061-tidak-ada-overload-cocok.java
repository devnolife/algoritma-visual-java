// Error: tidak ada overload yang cocok (no suitable method found for cetak(String,int))
public class Main {
    static void cetak(int x) {
        System.out.println("int " + x);
    }

    static void cetak(double x) {
        System.out.println("double " + x);
    }

    public static void main(String[] args) {
        cetak(5);
        cetak("nilai", 5);
    }
}
