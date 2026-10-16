// switch String dengan hashCode sama ("Aa" vs "BB"), label konstanta ekspresi char dan static final String
public class Main {
    static final String PERINTAH_SIMPAN = "simpan";

    static String klasifikasi(String s) {
        switch (s) {
            case "Aa":
                return "kode Aa";
            case "BB":
                return "kode BB";
            case "":
                return "kosong";
            case PERINTAH_SIMPAN:
                return "perintah simpan";
            default:
                return "lainnya";
        }
    }

    static String jenisHuruf(char c) {
        switch (c) {
            case 'a':
                return "a";
            case 'a' + 1:
                return "b (dari 'a' + 1)";
            case 99:
                return "c (dari 99)";
            case (char) 100:
                return "d (dari cast)";
            default:
                return "lain";
        }
    }

    public static void main(String[] args) {
        String[] uji = {"Aa", "BB", "", "AaAa", "BBBB", "AaBB", "aa", "simpan", "Simpan"};
        for (String u : uji) {
            System.out.println("[" + u + "] hash " + u.hashCode() + " -> " + klasifikasi(u));
        }
        for (char c = 'a'; c <= 'e'; c++) {
            System.out.println(c + " -> " + jenisHuruf(c));
        }
    }
}
