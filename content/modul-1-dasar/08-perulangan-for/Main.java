public class Main {
    public static void main(String[] args) {
        int n = 5;
        int jumlah = 0;

        for (int i = 1; i <= n; i++) {      // #kepala
            jumlah = jumlah + i;            // #akumulasi
            System.out.println("i = " + i + ", jumlah = " + jumlah);
        }
        System.out.println("Total: " + jumlah);
    }
}
