// Error: variabel yang dideklarasikan di dalam try dipakai di blok catch (cannot find symbol, symbol: variable hasil)
public class Main {
    public static void main(String[] args) {
        try {
            int hasil = 100 / Integer.parseInt("0");
            System.out.println(hasil);
        } catch (ArithmeticException e) {
            System.out.println("gagal menghitung " + hasil);
        }
    }
}
