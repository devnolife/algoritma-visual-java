// Frekuensi huruf dengan array int[26] dan histogram bintang
public class Main {
    public static void main(String[] args) {
        String teks = "Struktur Data dan Algoritma adalah dasar pemrograman";
        int[] frekuensi = new int[26];
        int totalHuruf = 0;
        for (int i = 0; i < teks.length(); i++) {
            char c = Character.toLowerCase(teks.charAt(i));
            if (c >= 'a' && c <= 'z') {
                frekuensi[c - 'a']++;
                totalHuruf++;
            }
        }
        System.out.println("Total huruf: " + totalHuruf);
        int maks = 0;
        char terbanyak = ' ';
        for (int i = 0; i < 26; i++) {
            if (frekuensi[i] > 0) {
                System.out.println((char) ('a' + i) + " " + "*".repeat(frekuensi[i]) + " " + frekuensi[i]);
            }
            if (frekuensi[i] > maks) {
                maks = frekuensi[i];
                terbanyak = (char) ('a' + i);
            }
        }
        System.out.println("Huruf terbanyak: '" + terbanyak + "' sebanyak " + maks + " kali");
        String tidakMuncul = "";
        for (int i = 0; i < 26; i++) {
            if (frekuensi[i] == 0) {
                tidakMuncul += (char) ('a' + i);
            }
        }
        System.out.println("Tidak muncul: " + tidakMuncul);
    }
}
