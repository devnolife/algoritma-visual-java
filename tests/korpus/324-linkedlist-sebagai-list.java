// LinkedList lewat antarmuka List: add di indeks, remove(int) vs remove(Object), Iterator.remove, dan equals dengan ArrayList berisi sama
import java.util.ArrayList;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        List<String> tugas = new LinkedList<>();
        tugas.add("desain");
        tugas.add("koding");
        tugas.add("uji");
        tugas.add(1, "review desain");
        tugas.add(0, "analisis");
        System.out.println("tugas " + tugas);
        System.out.println("indexOf(uji) " + tugas.indexOf("uji") + ", get(2) " + tugas.get(2));
        tugas.remove(1);
        tugas.remove("uji");
        System.out.println("setelah remove(1) dan remove(uji): " + tugas);
        Iterator<String> it = tugas.iterator();
        while (it.hasNext()) {
            String t = it.next();
            if (t.contains("desain")) {
                it.remove();
            }
        }
        System.out.println("setelah iterator menghapus yang memuat 'desain': " + tugas);
        List<String> pembanding = new ArrayList<>();
        pembanding.add("analisis");
        pembanding.add("koding");
        System.out.println("equals ArrayList berisi sama? " + tugas.equals(pembanding) + ", hashCode sama? " + (tugas.hashCode() == pembanding.hashCode()));
        int nomor = 1;
        for (String t : tugas) {
            System.out.println(nomor++ + ". " + t);
        }
    }
}
