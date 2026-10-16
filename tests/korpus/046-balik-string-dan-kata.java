// Membalik string per karakter dan membalik urutan kata dalam kalimat
public class Main {
    static String balik(String s) {
        String hasil = "";
        for (int i = s.length() - 1; i >= 0; i--) {
            hasil = hasil + s.charAt(i);
        }
        return hasil;
    }

    static String balikKata(String kalimat) {
        String[] kata = kalimat.trim().split("\\s+");
        String hasil = "";
        for (int i = kata.length - 1; i >= 0; i--) {
            hasil += kata[i];
            if (i > 0) {
                hasil += " ";
            }
        }
        return hasil;
    }

    public static void main(String[] args) {
        System.out.println(balik("Indonesia"));
        System.out.println(balik("12345"));
        System.out.println("[" + balik("") + "]");
        System.out.println(balikKata("saya suka belajar java"));
        System.out.println(balikKata("   spasi   di   mana-mana  "));
        String kalimat = "algoritma itu menyenangkan";
        String[] kata = kalimat.split(" ");
        for (int i = 0; i < kata.length; i++) {
            kata[i] = balik(kata[i]);
        }
        System.out.println(String.join(" ", kata));
        char[] cs = "abcdef".toCharArray();
        String hasil = "";
        for (char c : cs) {
            hasil = c + hasil;
        }
        System.out.println(hasil);
    }
}
