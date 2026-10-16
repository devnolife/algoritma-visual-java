// Antrian array sirkular buatan sendiri: indeks depan/belakang memutar dengan modulo, isi array mentah dicetak untuk melihat wrap-around
import java.util.Arrays;

public class Main {
    static class AntrianSirkular {
        int[] data;
        int depan;
        int belakang;
        int jumlah;

        AntrianSirkular(int kapasitas) {
            data = new int[kapasitas];
        }

        boolean masuk(int x) {
            if (jumlah == data.length) {
                return false;
            }
            data[belakang] = x;
            belakang = (belakang + 1) % data.length;
            jumlah++;
            return true;
        }

        int keluar() {
            int x = data[depan];
            data[depan] = 0;
            depan = (depan + 1) % data.length;
            jumlah--;
            return x;
        }

        String status() {
            return Arrays.toString(data) + " depan=" + depan + " belakang=" + belakang + " jumlah=" + jumlah;
        }
    }

    public static void main(String[] args) {
        AntrianSirkular q = new AntrianSirkular(4);
        for (int i = 1; i <= 5; i++) {
            System.out.println("masuk " + i + " -> " + q.masuk(i) + "  " + q.status());
        }
        for (int i = 0; i < 3; i++) {
            System.out.println("keluar " + q.keluar() + "  " + q.status());
        }
        for (int i = 6; i <= 8; i++) {
            System.out.println("masuk " + i + " -> " + q.masuk(i) + "  " + q.status());
        }
        StringBuilder sisa = new StringBuilder();
        while (q.jumlah > 0) {
            sisa.append(q.keluar()).append(' ');
        }
        System.out.println("keluarkan semua: " + sisa.toString().trim() + "  " + q.status());
    }
}
