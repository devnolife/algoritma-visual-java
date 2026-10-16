// Bug klasik: menghapus dengan loop indeks maju melewatkan elemen yang bergeser; loop mundur, i-- setelah remove, atau while memperbaikinya
import java.util.ArrayList;

public class Main {
    static ArrayList<Integer> buat() {
        ArrayList<Integer> a = new ArrayList<>();
        int[] isi = {2, 4, 4, 5, 6, 6, 6, 7, 8};
        for (int x : isi) {
            a.add(x);
        }
        return a;
    }

    public static void main(String[] args) {
        ArrayList<Integer> salah = buat();
        for (int i = 0; i < salah.size(); i++) {
            if (salah.get(i) % 2 == 0) {
                salah.remove(i);
            }
        }
        System.out.println("loop maju (salah)      : " + salah);
        ArrayList<Integer> mundur = buat();
        for (int i = mundur.size() - 1; i >= 0; i--) {
            if (mundur.get(i) % 2 == 0) {
                mundur.remove(i);
            }
        }
        System.out.println("loop mundur (benar)    : " + mundur);
        ArrayList<Integer> koreksi = buat();
        int langkah = 0;
        for (int i = 0; i < koreksi.size(); i++) {
            langkah++;
            if (koreksi.get(i) % 2 == 0) {
                koreksi.remove(i);
                i--;
            }
        }
        System.out.println("maju dengan i-- (benar): " + koreksi + " dalam " + langkah + " langkah");
        ArrayList<Integer> denganWhile = buat();
        int i = 0;
        while (i < denganWhile.size()) {
            if (denganWhile.get(i) % 2 == 0) {
                denganWhile.remove(i);
            } else {
                i++;
            }
        }
        System.out.println("while (benar)          : " + denganWhile);
    }
}
