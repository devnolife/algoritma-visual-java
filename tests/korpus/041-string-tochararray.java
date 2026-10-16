// toCharArray, new String(char[]), String.valueOf(char[]) dan pengurutan huruf
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        String kata = "Pemrograman";
        char[] huruf = kata.toCharArray();
        System.out.println("Panjang array: " + huruf.length);
        System.out.println(Arrays.toString(huruf));
        for (int i = 0, j = huruf.length - 1; i < j; i++, j--) {
            char tmp = huruf[i];
            huruf[i] = huruf[j];
            huruf[j] = tmp;
        }
        String terbalik = new String(huruf);
        System.out.println("Terbalik: " + terbalik);
        System.out.println("Asli tetap: " + kata);
        char[] urut = kata.toLowerCase().toCharArray();
        Arrays.sort(urut);
        System.out.println("Huruf urut: " + String.valueOf(urut));
        int[] hitung = new int[26];
        for (char c : urut) {
            hitung[c - 'a']++;
        }
        for (int i = 0; i < 26; i++) {
            if (hitung[i] > 1) {
                System.out.println((char) ('a' + i) + " muncul " + hitung[i] + " kali");
            }
        }
        char[] sandi = {'r', 'a', 'h', 'a', 's', 'i', 'a'};
        for (int i = 0; i < sandi.length; i++) {
            if (sandi[i] == 'a') {
                sandi[i] = '4';
            }
        }
        System.out.println("Sandi: " + String.valueOf(sandi));
        System.out.println("Huruf pertama dan terakhir: " + sandi[0] + sandi[sandi.length - 1]);
        System.out.println(sandi[0] + sandi[1] + " <- dijumlah sebagai int");
    }
}
