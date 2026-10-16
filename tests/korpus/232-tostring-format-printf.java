// toString dibangun dengan String.format lalu dipakai printf %s dengan lebar kolom untuk mencetak transkrip rapi
public class Main {
    static class Nilai {
        String matkul;
        int sks;
        double angka;

        Nilai(String matkul, int sks, double angka) {
            this.matkul = matkul;
            this.sks = sks;
            this.angka = angka;
        }

        String huruf() {
            if (angka >= 85) {
                return "A";
            } else if (angka >= 70) {
                return "B";
            } else if (angka >= 55) {
                return "C";
            }
            return "D";
        }

        @Override
        public String toString() {
            return String.format("%-18s %d SKS %6.2f %s", matkul, sks, angka, huruf());
        }
    }

    public static void main(String[] args) {
        Nilai[] transkrip = {
            new Nilai("Algoritma", 3, 88.5),
            new Nilai("Struktur Data", 4, 72.25),
            new Nilai("Basis Data", 3, 54.999),
            new Nilai("Etika Profesi", 2, 91)
        };
        int no = 1;
        for (Nilai n : transkrip) {
            System.out.printf("%2d. %s%n", no++, n);
        }
        double totalBobot = 0;
        int totalSks = 0;
        for (Nilai n : transkrip) {
            int bobot = n.huruf().equals("A") ? 4 : n.huruf().equals("B") ? 3 : n.huruf().equals("C") ? 2 : 1;
            totalBobot += bobot * n.sks;
            totalSks += n.sks;
        }
        System.out.printf("IPK = %.2f dari %d SKS%n", totalBobot / totalSks, totalSks);
        System.out.println("[" + transkrip[2] + "]");
        System.out.printf("|%30s|%n", transkrip[3].matkul);
        String baris = transkrip[0].toString();
        System.out.println("panjang baris = " + baris.length());
    }
}
