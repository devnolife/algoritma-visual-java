public class Main {
    public static void main(String[] args) {
        int permen = 17;
        int anak = 5;
        int bagian = permen / anak;            // #bagiBulat
        int sisa = permen % anak;
        double setengah = permen / 2.0;
        int hasil = 2 + 3 * 4;                 // #presedensi
        int skor = 10;
        skor += 5;
        skor++;
        boolean genap = skor % 2 == 0;
        boolean ganjil = !genap;
        if (skor >= 15 && sisa != 0) {         // #logika
            System.out.println("Kedua syarat terpenuhi");
        }
        System.out.println("Bagian per anak: " + bagian);
        System.out.println("Sisa permen: " + sisa);
    }
}
