// Error: variabel hanya diisi di dalam try lalu dipakai setelah try-catch (variable angka might not have been initialized)
public class Main {
    public static void main(String[] args) {
        String masukan = "x7";
        int angka;
        try {
            angka = Integer.parseInt(masukan);
        } catch (NumberFormatException e) {
            System.out.println("masukan tidak valid");
        }
        System.out.println("angka = " + angka);
    }
}
