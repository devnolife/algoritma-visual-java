public class Main {
    public static void main(String[] args) {
        String kata = "kasur";
        String besar = kata.toUpperCase();   // #baru
        System.out.println(kata + " " + besar);

        String lagi = "kasur";
        String salinan = new String("kasur");
        System.out.println(kata == lagi);
        System.out.println(kata == salinan);   // #samaDengan
        System.out.println(kata.equals(salinan));

        String balik = "";
        for (int i = kata.length() - 1; i >= 0; i--) {
            balik += kata.charAt(i);   // #balik
        }
        System.out.println("Dibalik: " + balik);

        String kalimat = "algoritma itu seru";
        int jumlahVokal = 0;
        for (int i = 0; i < kalimat.length(); i++) {
            char c = kalimat.charAt(i);
            if (c == 'a' || c == 'i' || c == 'u'
                    || c == 'e' || c == 'o') {
                jumlahVokal++;
            }
        }
        System.out.println("Jumlah vokal: " + jumlahVokal);
    }
}
