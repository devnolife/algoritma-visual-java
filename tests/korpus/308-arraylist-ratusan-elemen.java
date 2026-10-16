// ArrayList tumbuh sampai ratusan elemen: menambah, menjumlah, menghapus dari depan dan belakang, serta indexOf/lastIndexOf di data besar
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> kuadrat = new ArrayList<>();
        for (int i = 0; i < 600; i++) {
            kuadrat.add(i * i % 1000);
        }
        System.out.println("size " + kuadrat.size() + ", awal " + kuadrat.get(0) + " " + kuadrat.get(1) + " " + kuadrat.get(2) + ", akhir " + kuadrat.get(599));
        long total = 0;
        for (int k : kuadrat) {
            total += k;
        }
        System.out.println("total " + total);
        System.out.println("indexOf(961) " + kuadrat.indexOf(961) + ", lastIndexOf(961) " + kuadrat.lastIndexOf(961) + ", contains(2) " + kuadrat.contains(2));
        for (int i = 0; i < 200; i++) {
            kuadrat.remove(0);
        }
        System.out.println("setelah 200x remove(0): size " + kuadrat.size() + ", depan " + kuadrat.get(0));
        while (kuadrat.size() > 150) {
            kuadrat.remove(kuadrat.size() - 1);
        }
        System.out.println("setelah dipangkas: size " + kuadrat.size() + ", belakang " + kuadrat.get(kuadrat.size() - 1));
        int genap = 0;
        for (int k : kuadrat) {
            if (k % 2 == 0) {
                genap++;
            }
        }
        System.out.println("genap " + genap + ", ganjil " + (kuadrat.size() - genap));
        StringBuilder sepuluh = new StringBuilder();
        for (int i = 0; i < 10; i++) {
            sepuluh.append(kuadrat.get(i)).append(' ');
        }
        System.out.println("10 pertama: " + sepuluh.toString().trim());
    }
}
