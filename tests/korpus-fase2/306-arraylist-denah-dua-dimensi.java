// Denah kursi dengan ArrayList<ArrayList<String>>: baris berbeda panjang, sisip kursi, pindah penumpang, dan cetak denah
import java.util.ArrayList;

public class Main {
    static void cetak(ArrayList<ArrayList<String>> denah) {
        for (int i = 0; i < denah.size(); i++) {
            StringBuilder sb = new StringBuilder("baris " + (i + 1) + ":");
            for (String kursi : denah.get(i)) {
                sb.append(' ').append(kursi);
            }
            System.out.println(sb);
        }
    }

    public static void main(String[] args) {
        ArrayList<ArrayList<String>> denah = new ArrayList<>();
        int[] lebar = {2, 4, 3};
        for (int l : lebar) {
            ArrayList<String> baris = new ArrayList<>();
            for (int k = 0; k < l; k++) {
                baris.add("[ ]");
            }
            denah.add(baris);
        }
        cetak(denah);
        denah.get(1).set(2, "[A]");
        denah.get(0).set(0, "[B]");
        denah.get(2).add("[C]");
        denah.get(0).add(1, "[ ]");
        System.out.println("setelah diisi:");
        cetak(denah);
        String pindah = denah.get(1).set(2, "[ ]");
        denah.get(2).set(0, pindah);
        System.out.println("A pindah ke baris 3:");
        cetak(denah);
        int terisi = 0;
        int total = 0;
        for (ArrayList<String> baris : denah) {
            for (String k : baris) {
                total++;
                if (!k.equals("[ ]")) {
                    terisi++;
                }
            }
        }
        System.out.println(terisi + " dari " + total + " kursi terisi; denah = " + denah);
    }
}
