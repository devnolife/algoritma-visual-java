// ArrayDeque sebagai antrian FIFO: offer di belakang, poll dan peek di depan; simulasi loket dengan waktu layanan berbeda
import java.util.ArrayDeque;

public class Main {
    static class Pelanggan {
        String nama;
        int lama;

        Pelanggan(String nama, int lama) {
            this.nama = nama;
            this.lama = lama;
        }

        @Override
        public String toString() {
            return nama + "(" + lama + ")";
        }
    }

    public static void main(String[] args) {
        ArrayDeque<Pelanggan> antrian = new ArrayDeque<>();
        antrian.offer(new Pelanggan("Ani", 3));
        antrian.offer(new Pelanggan("Budi", 1));
        antrian.offer(new Pelanggan("Cici", 4));
        antrian.add(new Pelanggan("Dodi", 2));
        System.out.println("antrian awal: " + antrian);
        int waktu = 0;
        int putaran = 0;
        while (!antrian.isEmpty()) {
            putaran++;
            Pelanggan p = antrian.poll();
            waktu += p.lama;
            System.out.println("menit " + waktu + ": selesai melayani " + p.nama + ", berikutnya " + antrian.peek() + ", sisa " + antrian.size());
            if (putaran == 2) {
                antrian.offer(new Pelanggan("Eka", 2));
                System.out.println("  Eka datang -> " + antrian);
            }
        }
        System.out.println("total waktu " + waktu + " menit, peek saat kosong: " + antrian.peek());
    }
}
