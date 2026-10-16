// Iterator.remove sebelum next atau dua kali berturut-turut melempar IllegalStateException tanpa pesan
import java.util.ArrayList;
import java.util.Iterator;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> nilai = new ArrayList<>();
        for (int i = 1; i <= 6; i++) {
            nilai.add(i * 15);
        }
        Iterator<Integer> it = nilai.iterator();
        try {
            it.remove();
        } catch (IllegalStateException e) {
            System.out.println("remove sebelum next: " + e);
        }
        while (it.hasNext()) {
            int n = it.next();
            if (n % 30 == 0) {
                it.remove();
                System.out.println("hapus " + n + " -> " + nilai);
            }
        }
        Iterator<Integer> it2 = nilai.iterator();
        System.out.println("next = " + it2.next());
        it2.remove();
        System.out.println("setelah remove pertama: " + nilai);
        it2.remove();
        System.out.println("tidak tercetak");
    }
}
