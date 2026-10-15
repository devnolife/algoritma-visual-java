public class Main {
    public static void main(String[] args) {
        int angka = 120;
        long angkaLong = angka;
        double angkaDouble = angkaLong;

        double suhu = 36.9;
        int suhuBulat = (int) suhu;

        char huruf = 'A';
        int kodeHuruf = huruf;
        char hurufLain = (char) (huruf + 1);

        int terbesar = Integer.MAX_VALUE;
        int lewatBatas = terbesar + 1;

        double beratBeras = 47.5;
        int jumlahKarung = (int) (beratBeras / 5);

        System.out.println("angkaDouble = " + angkaDouble);
        System.out.println("suhuBulat   = " + suhuBulat);
        System.out.println("kodeHuruf   = " + kodeHuruf);
        System.out.println("hurufLain   = " + hurufLain);
        System.out.println("lewatBatas  = " + lewatBatas);
        System.out.println("Karung penuh: " + jumlahKarung);
    }
}
