// HashSet<String> berisi kata-kata sebuah teks: urutan iterasi berubah saat tabel diperbesar (12 -> 13 dan 24 -> 25 elemen), duplikat dihitung
import java.util.HashSet;

public class Main {
    public static void main(String[] args) {
        String teks = "di sebuah desa kecil hiduplah seorang petani yang rajin dan seorang anaknya yang pandai "
            + "setiap pagi petani pergi ke sawah dan anaknya pergi ke sekolah di desa sebelah "
            + "pada sore hari mereka makan bersama dan bercerita tentang hari yang telah dilalui";
        HashSet<String> unik = new HashSet<>();
        int duplikat = 0;
        int ke = 0;
        for (String kata : teks.split(" ")) {
            ke++;
            boolean baru = unik.add(kata);
            if (!baru) {
                duplikat++;
            }
            int n = unik.size();
            if (baru && (n == 12 || n == 13 || n == 24 || n == 25)) {
                System.out.println("kata ke-" + ke + ", " + n + " unik: " + unik);
            }
        }
        System.out.println("total kata " + ke + ", unik " + unik.size() + ", duplikat " + duplikat);
        System.out.println(unik);
        System.out.println("contains(\"sawah\") " + unik.contains("sawah") + ", contains(\"kota\") " + unik.contains("kota"));
    }
}
