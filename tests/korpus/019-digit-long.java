// Operasi digit pada long: balik angka, jumlah digit, Long.toString dan compare
public class Main {
    static long balik(long n) {
        long hasil = 0;
        while (n != 0) {
            hasil = hasil * 10 + n % 10;
            n /= 10;
        }
        return hasil;
    }

    static int jumlahDigit(long n) {
        int jumlah = 0;
        n = Math.abs(n);
        while (n > 0) {
            jumlah += (int) (n % 10);
            n /= 10;
        }
        return jumlah;
    }

    public static void main(String[] args) {
        long[] data = {1234567890123L, 9876543210L, -45678L, Long.MAX_VALUE, 1000000000000L};
        for (long x : data) {
            System.out.println(x + " -> balik " + balik(x) + ", jumlah digit " + jumlahDigit(x)
                    + ", panjang " + Long.toString(x).length());
        }
        System.out.println("Long.compare(-1, 1) = " + Long.compare(-1L, 1L));
        System.out.println("Long.compare(7, 7)  = " + Long.compare(7L, 7L));
        long nim = Long.parseLong("2023010045");
        System.out.println("Angkatan dari NIM " + nim + " = " + nim / 1000000);
        System.out.println("Nomor urut = " + nim % 10000);
        long telepon = 6281234567890L;
        System.out.println("Kode negara = " + telepon / 100000000000L);
    }
}
