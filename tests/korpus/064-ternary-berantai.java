// Operator ternary berantai dan tipe hasil ternary (promosi numerik, char vs int)
public class Main {
    static String predikat(int nilai) {
        return nilai >= 85 ? "A" : nilai >= 70 ? "B" : nilai >= 55 ? "C" : nilai >= 40 ? "D" : "E";
    }

    public static void main(String[] args) {
        int[] nilai = {90, 85, 72, 55, 41, 10};
        for (int n : nilai) {
            System.out.println(n + " -> " + predikat(n));
        }
        System.out.println(true ? 1 : 2.0);
        System.out.println(false ? 1 : 2.0);
        System.out.println(true ? 'a' : 0);
        System.out.println(false ? 'a' : 98);
        int i = 98;
        System.out.println(true ? 'a' : i);
        System.out.println(false ? 1 : 'b');
        long besar = 5;
        System.out.println(true ? 3 : besar);
        char c = true ? 'x' : 'y';
        System.out.println(c);
        int a = 7, b = 12;
        int maks = a > b ? a : b;
        int min = a < b ? a : b;
        System.out.println("maks = " + maks + ", min = " + min);
        String paritas = a % 2 == 0 ? "genap" : "ganjil";
        System.out.println(a + " " + paritas);
        int x = -5;
        int abs = x < 0 ? -x : x;
        System.out.println("|x| = " + abs);
        System.out.println("Tanda: " + (x > 0 ? "positif" : x < 0 ? "negatif" : "nol"));
        int jumlah = 1;
        System.out.println("Ada " + jumlah + " barang" + (jumlah > 1 ? "-barang" : ""));
        double diskon = a > 5 ? 0.1 : 0;
        System.out.println("Diskon = " + diskon);
        int hitung = 0;
        int hasil = a > b ? hitung++ : hitung--;
        System.out.println("hasil = " + hasil + ", hitung = " + hitung);
    }
}
