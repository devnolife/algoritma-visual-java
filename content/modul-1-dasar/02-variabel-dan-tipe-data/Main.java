public class Main {
    public static void main(String[] args) {
        int umur;                              // #deklarasi
        umur = 19;
        double tinggi = 1.65;
        char golonganDarah = 'O';
        boolean sudahLulus = false;
        long pendudukDunia = 8100000000L;
        String nama = "Rina";
        final int SKS_MAKSIMUM = 24;           // #final
        System.out.println(nama + ", " + umur + " tahun");
        umur = umur + 1;                       // #ubah
        System.out.println("Tahun depan: " + umur);
        System.out.println("Batas SKS: " + SKS_MAKSIMUM);
    }
}
