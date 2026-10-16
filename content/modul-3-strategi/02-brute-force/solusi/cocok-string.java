public class Main {
    public static void main(String[] args) {
        int n = 7;
        int[] harga = new int[n];
        for (int i = 0; i < n; i++) {
            harga[i] = (i * 37 + 11) % 50 + 1;   // 1..50 ribu
        }
        int target = 59;
        int perbandingan = 0;
        int ditemukan = 0;
        for (int i = 0; i < n - 1; i++) {   // #luar
            for (int j = i + 1; j < n; j++) {   // #dalam
                perbandingan++;
                if (harga[i] + harga[j] == target) {   // #cek
                    ditemukan++;
                    System.out.print(harga[i] + " + ");
                    System.out.println(harga[j]);
                }
            }
        }
        System.out.println("Pasangan: " + ditemukan);
        System.out.println("Perbandingan: " + perbandingan);
        System.out.println("abra: " + hitungKemunculan("abrakadabra", "abra"));
        System.out.println("aa: " + hitungKemunculan("aaaa", "aa"));
    }

    static int hitungKemunculan(String teks, String pola) {
        int hitung = 0;
        for (int i = 0; i <= teks.length() - pola.length(); i++) {
            int k = 0;
            while (k < pola.length() && teks.charAt(i + k) == pola.charAt(k)) {
                k++;
            }
            if (k == pola.length()) {
                hitung++;
            }
        }
        return hitung;
    }
}