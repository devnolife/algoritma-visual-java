// Error: kata kunci case di luar switch (orphaned case)
public class Main {
    static void tampilJudul(String judul) {
        String garis = "=".repeat(judul.length() + 8);
        System.out.println(garis);
        System.out.println("=== " + judul + " ===");
        System.out.println(garis);
    }

    public static void main(String[] args) {
        tampilJudul("Latihan Java");
        int menu = 1;
        if (menu == 1) {
            case 1:
                System.out.println("satu");
        }
    }
}
