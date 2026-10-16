public class Main {
    public static void main(String[] args) {
        int n = 7;
        int[] harga = new int[n];
        for (int i = 0; i < n; i++) {
            harga[i] = (i * 37 + 11) % 50 + 1;   // 1..50 ribu
        }
        int target = 93;
        int perbandingan = 0;
        int ditemukan = 0;
        for (int i = 0; i < n - 2; i++) {
            for (int j = i + 1; j < n - 1; j++) {
                for (int k = j + 1; k < n; k++) {
                    perbandingan++;
                    if (harga[i] + harga[j] + harga[k] == target) {
                        ditemukan++;
                        System.out.print(harga[i] + " + " + harga[j] + " + ");
                        System.out.println(harga[k]);
                    }
                }
            }
        }
        System.out.println("Kombinasi: " + ditemukan);
        System.out.println("Perbandingan: " + perbandingan);
    }
}