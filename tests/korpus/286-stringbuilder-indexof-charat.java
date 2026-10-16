// indexOf, lastIndexOf, charAt, dan substring pada StringBuilder untuk mencari dan mengganti semua kemunculan sebuah kata
public class Main {
    static int gantiSemua(StringBuilder sb, String cari, String ganti) {
        int n = 0;
        int i = sb.indexOf(cari);
        while (i >= 0) {
            sb.replace(i, i + cari.length(), ganti);
            n++;
            i = sb.indexOf(cari, i + ganti.length());
        }
        return n;
    }

    public static void main(String[] args) {
        StringBuilder teks = new StringBuilder("kucing makan ikan, kucing tidur, anak kucing bermain");
        System.out.println("indexOf(\"kucing\") = " + teks.indexOf("kucing"));
        System.out.println("indexOf(\"kucing\", 1) = " + teks.indexOf("kucing", 1));
        System.out.println("lastIndexOf(\"kucing\") = " + teks.lastIndexOf("kucing"));
        System.out.println("indexOf(\"anjing\") = " + teks.indexOf("anjing"));
        System.out.println("charAt(7) = " + teks.charAt(7) + ", substring(7, 12) = " + teks.substring(7, 12) + ", substring(46) = " + teks.substring(46));
        int jumlah = gantiSemua(teks, "kucing", "kucing-kucing");
        System.out.println(jumlah + " penggantian: " + teks);
        int koma = 0;
        for (int i = 0; i < teks.length(); i++) {
            if (teks.charAt(i) == ',') {
                koma++;
            }
        }
        System.out.println("jumlah koma = " + koma + ", panjang akhir = " + teks.length());
        StringBuilder sandi = new StringBuilder("rahasia");
        for (int i = 0; i < sandi.length(); i++) {
            if ("aiueo".indexOf(sandi.charAt(i)) >= 0) {
                sandi.setCharAt(i, '*');
            }
        }
        System.out.println("sandi tersamar: " + sandi);
    }
}
