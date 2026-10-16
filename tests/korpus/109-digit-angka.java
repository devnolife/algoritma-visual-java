// Operasi digit int: jumlah digit, banyak digit, balik angka, akar digital, palindrom angka
public class Main {
    static int balik(int n) {
        int hasil = 0;
        while (n != 0) {
            hasil = hasil * 10 + n % 10;
            n /= 10;
        }
        return hasil;
    }

    static int akarDigital(int n) {
        while (n >= 10) {
            int jumlah = 0;
            while (n > 0) {
                jumlah += n % 10;
                n /= 10;
            }
            n = jumlah;
        }
        return n;
    }

    public static void main(String[] args) {
        int[] data = {12345, 9, 1000, 987654321, -472, 1221};
        for (int x : data) {
            int n = Math.abs(x);
            int jumlah = 0, banyak = 0;
            do {
                jumlah += n % 10;
                banyak++;
                n /= 10;
            } while (n > 0);
            System.out.println(x + ": jumlah digit " + jumlah + ", banyak digit " + banyak
                    + ", dibalik " + balik(x) + ", akar digital " + akarDigital(Math.abs(x))
                    + ", palindrom " + (x == balik(x)));
        }
        System.out.println("balik(1000000003) = " + balik(1000000003));
        System.out.println("balik(2147483647) = " + balik(2147483647));
        int angka = 4096;
        int digitTerbesar = 0;
        while (angka > 0) {
            digitTerbesar = Math.max(digitTerbesar, angka % 10);
            angka /= 10;
        }
        System.out.println("Digit terbesar dari 4096 = " + digitTerbesar);
    }
}
