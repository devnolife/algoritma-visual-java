// Laporan nilai mahasiswa dengan printf: rata-rata, predikat, dan tabel rapi
public class Main {
    static char predikat(double nilai) {
        if (nilai >= 85) {
            return 'A';
        } else if (nilai >= 70) {
            return 'B';
        } else if (nilai >= 55) {
            return 'C';
        } else if (nilai >= 40) {
            return 'D';
        }
        return 'E';
    }

    public static void main(String[] args) {
        String[] nama = {"Andi", "Bunga", "Cahyo", "Dewi", "Eko"};
        int[][] nilai = {
            {80, 75, 90},
            {95, 88, 92},
            {60, 55, 48},
            {70, 72, 69},
            {30, 45, 50}
        };
        System.out.printf("%-3s %-8s %5s %5s %5s %8s %3s%n", "No", "Nama", "UTS", "UAS", "Tgs", "Rata", "Nil");
        double totalKelas = 0;
        int lulus = 0;
        for (int i = 0; i < nama.length; i++) {
            int jumlah = 0;
            for (int n : nilai[i]) {
                jumlah += n;
            }
            double rata = jumlah / 3.0;
            totalKelas += rata;
            char p = predikat(rata);
            if (p <= 'C') {
                lulus++;
            }
            System.out.printf("%-3d %-8s %5d %5d %5d %8.2f %3c%n",
                    i + 1, nama[i], nilai[i][0], nilai[i][1], nilai[i][2], rata, p);
        }
        System.out.printf("Rata-rata kelas: %.3f%n", totalKelas / nama.length);
        System.out.printf("Lulus: %d dari %d (%.1f%%)%n", lulus, nama.length, 100.0 * lulus / nama.length);
    }
}
