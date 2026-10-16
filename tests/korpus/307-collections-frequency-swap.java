// Collections.frequency untuk menghitung suara, Collections.swap untuk mengacak urutan dengan Random ber-seed, serta max/min hasil hitungan
import java.util.ArrayList;
import java.util.Collections;
import java.util.Random;

public class Main {
    public static void main(String[] args) {
        ArrayList<String> suara = new ArrayList<>();
        String[] masuk = {"Ani", "Budi", "Ani", "Cici", "Budi", "Ani", "Dodi", "Cici", "Ani", "Budi"};
        for (String s : masuk) {
            suara.add(s);
        }
        ArrayList<String> calon = new ArrayList<>();
        for (String s : suara) {
            if (!calon.contains(s)) {
                calon.add(s);
            }
        }
        ArrayList<Integer> hitungan = new ArrayList<>();
        for (String c : calon) {
            int n = Collections.frequency(suara, c);
            hitungan.add(n);
            System.out.println(c + ": " + n + " suara");
        }
        int maks = Collections.max(hitungan);
        System.out.println("pemenang: " + calon.get(hitungan.indexOf(maks)) + " dengan " + maks + " suara, suara terendah " + Collections.min(hitungan));
        Random acak = new Random(7);
        ArrayList<String> urutanTampil = new ArrayList<>(calon);
        for (int i = urutanTampil.size() - 1; i > 0; i--) {
            int j = acak.nextInt(i + 1);
            Collections.swap(urutanTampil, i, j);
            System.out.println("swap(" + i + ", " + j + ") -> " + urutanTampil);
        }
        System.out.println("frekuensi \"Eka\" = " + Collections.frequency(suara, "Eka") + ", frekuensi null = " + Collections.frequency(suara, null));
    }
}
