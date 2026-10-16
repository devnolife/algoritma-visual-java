// Mencari kata terpanjang dan terpendek dalam kalimat dengan split("\\s+")
public class Main {
    public static void main(String[] args) {
        String kalimat = "  Mahasiswa   belajar algoritma   setiap hari di laboratorium  ";
        String[] kata = kalimat.trim().split("\\s+");
        String terpanjang = kata[0];
        String terpendek = kata[0];
        int totalHuruf = 0;
        for (String k : kata) {
            if (k.length() > terpanjang.length()) {
                terpanjang = k;
            }
            if (k.length() < terpendek.length()) {
                terpendek = k;
            }
            totalHuruf += k.length();
        }
        System.out.println("Jumlah kata   : " + kata.length);
        System.out.println("Terpanjang    : " + terpanjang + " (" + terpanjang.length() + ")");
        System.out.println("Terpendek     : " + terpendek + " (" + terpendek.length() + ")");
        System.out.println("Rata panjang  : " + (double) totalHuruf / kata.length);
        String singkatan = "";
        for (String k : kata) {
            singkatan += Character.toUpperCase(k.charAt(0));
        }
        System.out.println("Singkatan     : " + singkatan);
        for (int i = 0; i < kata.length; i++) {
            if (kata[i].length() >= 7) {
                System.out.println("Kata panjang ke-" + (i + 1) + ": " + kata[i].toUpperCase());
            }
        }
    }
}
