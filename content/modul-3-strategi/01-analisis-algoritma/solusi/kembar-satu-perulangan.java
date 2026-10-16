public class Main {
    public static void main(String[] args) {
        int n = 6;
        int[] nilai = new int[n];
        for (int i = 0; i < n; i++) {
            nilai[i] = (i * 37 + 11) % 101;   // nilai 0..100
        }
        nilai[n - 1] = nilai[n - 2];   // #kembar
        int operasi = 0;

        // Bagian 1: satu perulangan, menjumlahkan semua nilai
        int total = 0;
        for (int i = 0; i < n; i++) {
            operasi++;   // #hitung
            total += nilai[i];
        }

        // Bagian 2: satu perulangan dengan array penanda nilai yang sudah muncul
        boolean adaKembar = false;
        boolean[] pernah = new boolean[101];
        for (int i = 0; i < n; i++) {
            operasi++;
            if (pernah[nilai[i]]) {
                adaKembar = true;
                break;
            }
            pernah[nilai[i]] = true;
        }
        System.out.println("Total nilai: " + total);
        System.out.println("Ada kembar: " + adaKembar);
        System.out.println("Operasi: " + operasi);
    }
}
