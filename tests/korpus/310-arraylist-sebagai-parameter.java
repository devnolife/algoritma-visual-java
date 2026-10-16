// ArrayList sebagai parameter method: add/set/clear di dalam method terlihat oleh pemanggil, tetapi menugaskan list baru ke parameter tidak
import java.util.ArrayList;

public class Main {
    static void tambahBonus(ArrayList<Integer> nilai, int bonus) {
        for (int i = 0; i < nilai.size(); i++) {
            nilai.set(i, Math.min(100, nilai.get(i) + bonus));
        }
    }

    static void gantiList(ArrayList<Integer> nilai) {
        nilai = new ArrayList<>();
        nilai.add(-1);
        System.out.println("  di dalam gantiList: " + nilai);
    }

    static ArrayList<Integer> saring(ArrayList<Integer> nilai, int batas) {
        ArrayList<Integer> hasil = new ArrayList<>();
        for (int n : nilai) {
            if (n >= batas) {
                hasil.add(n);
            }
        }
        return hasil;
    }

    static void kosongkan(ArrayList<Integer> nilai) {
        nilai.clear();
    }

    public static void main(String[] args) {
        ArrayList<Integer> nilai = new ArrayList<>();
        nilai.add(55);
        nilai.add(78);
        nilai.add(96);
        nilai.add(40);
        tambahBonus(nilai, 7);
        System.out.println("setelah bonus: " + nilai);
        gantiList(nilai);
        System.out.println("setelah gantiList: " + nilai);
        ArrayList<Integer> lulus = saring(nilai, 60);
        System.out.println("lulus: " + lulus + ", nilai asli tetap: " + nilai);
        lulus.add(0, 100);
        System.out.println("ubah hasil saring tidak mengubah asal: " + lulus + " / " + nilai);
        kosongkan(lulus);
        System.out.println("setelah kosongkan: " + lulus + ", size " + lulus.size());
    }
}
