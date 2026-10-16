// Permutasi rekursif dari "ABC" dan "ABCD" dengan substring, serta jumlah permutasi
public class Main {
    static int jumlah = 0;

    static void permutasi(String awalan, String sisa, boolean cetak) {
        if (sisa.isEmpty()) {
            jumlah++;
            if (cetak) {
                System.out.println(jumlah + ". " + awalan);
            }
            return;
        }
        for (int i = 0; i < sisa.length(); i++) {
            char c = sisa.charAt(i);
            String tanpaC = sisa.substring(0, i) + sisa.substring(i + 1);
            permutasi(awalan + c, tanpaC, cetak);
        }
    }

    static void tukarPermutasi(char[] a, int k) {
        if (k == a.length) {
            System.out.print(new String(a) + " ");
            return;
        }
        for (int i = k; i < a.length; i++) {
            char t = a[k];
            a[k] = a[i];
            a[i] = t;
            tukarPermutasi(a, k + 1);
            t = a[k];
            a[k] = a[i];
            a[i] = t;
        }
    }

    public static void main(String[] args) {
        permutasi("", "ABC", true);
        jumlah = 0;
        permutasi("", "ABCD", false);
        System.out.println("Jumlah permutasi ABCD = " + jumlah);
        tukarPermutasi("xyz".toCharArray(), 0);
        System.out.println();
    }
}
