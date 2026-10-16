// Arrays.asList berukuran tetap dan menempel pada array asalnya: set boleh (array ikut berubah), remove/add melempar UnsupportedOperationException
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class Main {
    public static void main(String[] args) {
        String[] hari = {"Senin", "Selasa", "Rabu"};
        List<String> daftar = Arrays.asList(hari);
        System.out.println("daftar " + daftar + ", size " + daftar.size());
        daftar.set(1, "SELASA");
        System.out.println("setelah daftar.set: array " + Arrays.toString(hari));
        hari[2] = "RABU";
        System.out.println("setelah array diubah: daftar " + daftar);
        System.out.println("contains(Senin) " + daftar.contains("Senin") + ", indexOf(RABU) " + daftar.indexOf("RABU"));
        List<Integer> angka = Arrays.asList(5, 3, 9, 1);
        Collections.sort(angka);
        System.out.println("asList boleh diurutkan: " + angka);
        ArrayList<Integer> bisaTumbuh = new ArrayList<>(angka);
        bisaTumbuh.add(10);
        System.out.println("salinan ArrayList bisa add: " + bisaTumbuh);
        int[] primitif = {1, 2, 3};
        List<int[]> jebakan = Arrays.asList(primitif);
        System.out.println("Arrays.asList(int[]) berisi " + jebakan.size() + " elemen (array-nya sendiri), elemen[0][2] = " + jebakan.get(0)[2]);
        try {
            daftar.remove(0);
        } catch (UnsupportedOperationException e) {
            System.out.println("remove: " + e);
        }
        try {
            daftar.get(3);
        } catch (IndexOutOfBoundsException e) {
            System.out.println("get(3): " + e);
        }
        angka.add(7);
        System.out.println("tidak tercetak");
    }
}
