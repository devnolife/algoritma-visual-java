// StringBuilder.reverse untuk cek palindrom dan membalik kata; equals pada StringBuilder membandingkan referensi, bukan isi
public class Main {
    static boolean palindrom(String s) {
        StringBuilder bersih = new StringBuilder();
        for (int i = 0; i < s.length(); i++) {
            char c = s.charAt(i);
            if (Character.isLetterOrDigit(c)) {
                bersih.append(Character.toLowerCase(c));
            }
        }
        String maju = bersih.toString();
        String mundur = bersih.reverse().toString();
        return maju.equals(mundur);
    }

    public static void main(String[] args) {
        String[] kalimat = {"Kasur ini rusak", "A man, a plan, a canal: Panama", "Struktur data", "12321", ""};
        for (String k : kalimat) {
            System.out.println("\"" + k + "\" palindrom? " + palindrom(k));
        }
        StringBuilder a = new StringBuilder("abc");
        StringBuilder b = new StringBuilder("abc");
        System.out.println("a.equals(b) = " + a.equals(b) + ", isi sama = " + a.toString().equals(b.toString()));
        StringBuilder r = a.reverse();
        System.out.println("reverse mengubah objek asal: a = " + a + ", r == a: " + (r == a));
        String[] kata = "belajar java itu menyenangkan".split(" ");
        StringBuilder hasil = new StringBuilder();
        for (int i = kata.length - 1; i >= 0; i--) {
            hasil.append(new StringBuilder(kata[i]).reverse());
            if (i > 0) {
                hasil.append(' ');
            }
        }
        System.out.println(hasil);
        System.out.println(hasil.reverse());
    }
}
