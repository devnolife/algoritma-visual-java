// Error: pernyataan setelah return tidak terjangkau (unreachable statement)
public class Main {
    static int kuadrat(int n) {
        return n * n;
        System.out.println("menghitung kuadrat");
    }

    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        System.out.println(kuadrat(5));
    }
}
