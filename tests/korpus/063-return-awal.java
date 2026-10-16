// return lebih awal dari method: pencarian indeks, validasi, dan void return
public class Main {
    static int cariIndeks(int[] data, int target) {
        for (int i = 0; i < data.length; i++) {
            if (data[i] == target) {
                return i;
            }
        }
        return -1;
    }

    static String kategoriUmur(int umur) {
        if (umur < 0) {
            return "tidak valid";
        }
        if (umur < 13) {
            return "anak";
        }
        if (umur < 18) {
            return "remaja";
        }
        return "dewasa";
    }

    static void cetakJikaPositif(int n) {
        if (n <= 0) {
            System.out.println(n + " diabaikan");
            return;
        }
        System.out.println(n + " positif");
    }

    static boolean adaDuplikat(int[] data) {
        for (int i = 0; i < data.length; i++) {
            for (int j = i + 1; j < data.length; j++) {
                if (data[i] == data[j]) {
                    System.out.println("  duplikat di indeks " + i + " dan " + j);
                    return true;
                }
            }
        }
        return false;
    }

    public static void main(String[] args) {
        int[] data = {7, 3, 9, 3, 5};
        System.out.println("Indeks 9 = " + cariIndeks(data, 9));
        System.out.println("Indeks 4 = " + cariIndeks(data, 4));
        int[] umur = {-1, 5, 15, 30};
        for (int u : umur) {
            System.out.println(u + " -> " + kategoriUmur(u));
        }
        cetakJikaPositif(5);
        cetakJikaPositif(-2);
        System.out.println("Ada duplikat? " + adaDuplikat(data));
        System.out.println("Ada duplikat? " + adaDuplikat(new int[] {1, 2, 3}));
    }
}
