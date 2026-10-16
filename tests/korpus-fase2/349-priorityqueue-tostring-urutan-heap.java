// toString dan for-each pada PriorityQueue menampilkan urutan array heap (bukan terurut); hanya poll berulang yang menghasilkan urutan terurut
import java.util.PriorityQueue;

public class Main {
    public static void main(String[] args) {
        PriorityQueue<String> tugas = new PriorityQueue<>();
        String[] nama = {"mencuci", "belajar", "makan", "tidur", "olahraga", "ibadah", "bermain"};
        for (String n : nama) {
            tugas.offer(n);
        }
        System.out.println("toString  : " + tugas);
        StringBuilder iterasi = new StringBuilder();
        for (String t : tugas) {
            iterasi.append(t).append(' ');
        }
        System.out.println("for-each  : " + iterasi.toString().trim());
        System.out.println("peek      : " + tugas.peek());
        StringBuilder terurut = new StringBuilder();
        PriorityQueue<String> salinan = new PriorityQueue<>(tugas);
        System.out.println("salinan   : " + salinan);
        while (!salinan.isEmpty()) {
            terurut.append(salinan.poll()).append(' ');
        }
        System.out.println("poll semua: " + terurut.toString().trim());
        System.out.println("asal tetap utuh: " + tugas + " (" + tugas.size() + ")");
    }
}
