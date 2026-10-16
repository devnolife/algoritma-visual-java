// Simulasi 600 lemparan dadu dengan Random(2024): frekuensi tiap mata dadu, enam beruntun, serta nextInt dengan batas pangkat dua (16) dan bukan (1000)
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        Random acak = new Random(2024);
        int[] frekuensi = new int[7];
        int enamBeruntun = 0;
        int beruntun = 0;
        for (int i = 0; i < 600; i++) {
            int mata = acak.nextInt(6) + 1;
            frekuensi[mata]++;
            if (mata == 6) {
                beruntun++;
                enamBeruntun = Math.max(enamBeruntun, beruntun);
            } else {
                beruntun = 0;
            }
        }
        for (int m = 1; m <= 6; m++) {
            System.out.printf("%d: %3d %s%n", m, frekuensi[m], "#".repeat(frekuensi[m] / 5));
        }
        System.out.println("enam beruntun terpanjang: " + enamBeruntun);
        StringBuilder pangkatDua = new StringBuilder();
        StringBuilder seribu = new StringBuilder();
        for (int i = 0; i < 8; i++) {
            pangkatDua.append(acak.nextInt(16)).append(' ');
            seribu.append(acak.nextInt(1000)).append(' ');
        }
        System.out.println("nextInt(16)  : " + pangkatDua.toString().trim());
        System.out.println("nextInt(1000): " + seribu.toString().trim());
    }
}
