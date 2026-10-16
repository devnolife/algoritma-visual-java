public class Main {
    public static void main(String[] args) {
        int[] pecahan = {2000, 1000, 500, 200, 100};   // #urut
        int[] jumlah = new int[pecahan.length];
        int sisa = 4900;
        for (int i = 0; i < pecahan.length; i++) {
            while (sisa >= pecahan[i]) {   // #rakus
                sisa -= pecahan[i];
                jumlah[i]++;
            }
            if (jumlah[i] > 0) {
                System.out.println(pecahan[i] + " x " + jumlah[i]);
            }
        }
        System.out.println("Sisa: " + sisa);   // #sisa
    }
}
