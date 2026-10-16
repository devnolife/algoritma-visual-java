// Tahun kabisat dengan && dan ||, menghitung hari dalam rentang tahun
public class Main {
    static boolean kabisat(int tahun) {
        return (tahun % 4 == 0 && tahun % 100 != 0) || tahun % 400 == 0;
    }

    public static void main(String[] args) {
        int[] uji = {1900, 2000, 2023, 2024, 2100, 2400, 1996};
        for (int t : uji) {
            System.out.println(t + (kabisat(t) ? " kabisat" : " bukan kabisat"));
        }
        int jumlahKabisat = 0;
        long totalHari = 0;
        for (int t = 1990; t <= 2030; t++) {
            if (kabisat(t)) {
                jumlahKabisat++;
                totalHari += 366;
            } else {
                totalHari += 365;
            }
        }
        System.out.println("Kabisat 1990-2030: " + jumlahKabisat + ", total hari: " + totalHari);
        int tanggal = 29, bulan = 2, tahun = 2023;
        boolean valid = bulan == 2 ? tanggal <= (kabisat(tahun) ? 29 : 28) : tanggal <= 31;
        System.out.println(tanggal + "/" + bulan + "/" + tahun + " valid? " + valid);
        int hariKe = 0;
        int[] hariBulan = {31, kabisat(2024) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31};
        for (int b = 0; b < 7; b++) {
            hariKe += hariBulan[b];
        }
        hariKe += 17;
        System.out.println("17 Agustus 2024 adalah hari ke-" + hariKe);
    }
}
