// list.remove(1) menghapus elemen di indeks 1, sedangkan list.remove(Integer.valueOf(1)) menghapus elemen bernilai 1
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        ArrayList<Integer> angka = new ArrayList<>();
        for (int i = 0; i < 6; i++) {
            angka.add(i * 2 % 5);
        }
        System.out.println("awal                     : " + angka);
        Integer terhapus = angka.remove(1);
        System.out.println("remove(1) menghapus indeks 1 (nilai " + terhapus + "): " + angka);
        boolean ada = angka.remove(Integer.valueOf(1));
        System.out.println("remove(Integer.valueOf(1)) -> " + ada + ": " + angka);
        boolean lagi = angka.remove((Integer) 9);
        System.out.println("remove((Integer) 9) -> " + lagi + ": " + angka);
        Object nol = 0;
        System.out.println("remove((Object) 0) -> " + angka.remove(nol) + ": " + angka);
        int indeks = angka.indexOf(3);
        System.out.println("indexOf(3) = " + indeks + ", contains(4) = " + angka.contains(4));
        angka.add(0, 7);
        angka.add(7);
        System.out.println("setelah add(0, 7) dan add(7): " + angka);
        System.out.println("remove(Integer.valueOf(7)) menghapus yang pertama -> " + angka.remove(Integer.valueOf(7)) + ": " + angka);
        try {
            angka.remove(10);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("remove(10) -> " + e.getMessage());
        }
        System.out.println("akhir: " + angka);
    }
}
