// TreeSet menjaga elemen unik dan terurut: angka, String (huruf besar sebelum garis bawah dan huruf kecil), first/last, floor/ceiling, pollFirst/pollLast
import java.util.TreeSet;

public class Main {
    public static void main(String[] args) {
        TreeSet<Integer> angka = new TreeSet<>();
        int[] masuk = {42, 7, 19, 7, -3, 100, 19, 0};
        for (int m : masuk) {
            boolean baru = angka.add(m);
            System.out.println("add " + m + " -> " + baru + ", " + angka);
        }
        System.out.println("first " + angka.first() + ", last " + angka.last() + ", size " + angka.size());
        System.out.println("floor(20) " + angka.floor(20) + ", ceiling(20) " + angka.ceiling(20) + ", higher(100) " + angka.higher(100));
        System.out.println("pollFirst " + angka.pollFirst() + ", pollLast " + angka.pollLast() + " -> " + angka);
        TreeSet<String> nama = new TreeSet<>();
        String[] isi = {"budi", "Ani", "citra", "Budi", "ani", "Zaki", "_admin"};
        for (String s : isi) {
            nama.add(s);
        }
        System.out.println("nama " + nama);
        int nomor = 1;
        for (String n : nama) {
            System.out.println(nomor++ + ". " + n);
        }
        System.out.println("remove(\"Zaki\") " + nama.remove("Zaki") + ", contains(\"budi\") " + nama.contains("budi") + ", first " + nama.first());
    }
}
