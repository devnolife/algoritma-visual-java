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

        // Bagian 2: perulangan bersarang, mencari kembar
        boolean adaKembar = false;
        for (int i = 0; i < n && !adaKembar; i++) {
            for (int j = i + 1; j < n; j++) {   // #dalam
                operasi++;
                if (nilai[i] == nilai[j]) {
                    adaKembar = true;
                    break;
                }
            }
        }
        System.out.println("Total nilai: " + total);
        System.out.println("Ada kembar: " + adaKembar);
        System.out.println("Operasi: " + operasi);
    }
}
