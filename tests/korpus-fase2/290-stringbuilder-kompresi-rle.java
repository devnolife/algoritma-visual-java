// Kompresi run-length (aaab -> a3b1) dan dekompresinya dengan StringBuilder, ditambah membalik urutan kata dalam kalimat
public class Main {
    static String kompres(String s) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            char c = s.charAt(i);
            int j = i;
            while (j < s.length() && s.charAt(j) == c) {
                j++;
            }
            sb.append(c).append(j - i);
            i = j;
        }
        return sb.toString();
    }

    static String dekompres(String s) {
        StringBuilder sb = new StringBuilder();
        int i = 0;
        while (i < s.length()) {
            char c = s.charAt(i);
            i++;
            int n = 0;
            while (i < s.length() && Character.isDigit(s.charAt(i))) {
                n = n * 10 + (s.charAt(i) - '0');
                i++;
            }
            for (int k = 0; k < n; k++) {
                sb.append(c);
            }
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String[] data = {"aaabccdddd", "abc", "zzzzzzzzzzzz", "", "aabbaa"};
        for (String d : data) {
            String k = kompres(d);
            String balik = dekompres(k);
            System.out.println("\"" + d + "\" -> \"" + k + "\" -> \"" + balik + "\" sama? " + balik.equals(d) + ", hemat " + (d.length() - k.length()));
        }
        String kalimat = "satu dua tiga empat lima";
        String[] kata = kalimat.split(" ");
        StringBuilder sb = new StringBuilder();
        for (int i = kata.length - 1; i >= 0; i--) {
            sb.append(kata[i]);
            if (i > 0) {
                sb.append(' ');
            }
        }
        System.out.println(sb);
        sb.insert(0, '[').append(']');
        System.out.println(sb + " panjang " + sb.length());
    }
}
