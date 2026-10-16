// Pemeriksaan anagram dengan mengurutkan char array dan Arrays.equals
import java.util.Arrays;

public class Main {
    static boolean anagram(String a, String b) {
        char[] x = a.replace(" ", "").toLowerCase().toCharArray();
        char[] y = b.replace(" ", "").toLowerCase().toCharArray();
        if (x.length != y.length) {
            return false;
        }
        Arrays.sort(x);
        Arrays.sort(y);
        return Arrays.equals(x, y);
    }

    static boolean anagramHitung(String a, String b) {
        int[] hitung = new int[26];
        for (char c : a.toLowerCase().toCharArray()) {
            if (Character.isLetter(c)) {
                hitung[c - 'a']++;
            }
        }
        for (char c : b.toLowerCase().toCharArray()) {
            if (Character.isLetter(c)) {
                hitung[c - 'a']--;
            }
        }
        for (int h : hitung) {
            if (h != 0) {
                return false;
            }
        }
        return true;
    }

    public static void main(String[] args) {
        String[][] pasangan = {
            {"listen", "silent"},
            {"Dormitory", "dirty room"},
            {"kasur", "rusak"},
            {"java", "jawa"},
            {"aab", "abb"}
        };
        for (String[] p : pasangan) {
            System.out.println(p[0] + " & " + p[1] + " -> " + anagram(p[0], p[1]) + " / " + anagramHitung(p[0], p[1]));
        }
    }
}
