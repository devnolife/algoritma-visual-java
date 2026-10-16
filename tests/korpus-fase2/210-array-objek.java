// Array berisi objek: mengisi, mencari skor terbesar, rata-rata, dan bubble sort dengan menukar referensi
public class Main {
    static class Pemain {
        String nama;
        int skor;

        Pemain(String nama, int skor) {
            this.nama = nama;
            this.skor = skor;
        }
    }

    static void cetak(Pemain[] tim) {
        StringBuilder sb = new StringBuilder();
        for (Pemain p : tim) {
            sb.append(p.nama).append('=').append(p.skor).append(' ');
        }
        System.out.println(sb.toString().trim());
    }

    public static void main(String[] args) {
        String[] nama = {"Andi", "Bayu", "Cici", "Dewi", "Eka"};
        int[] skor = {72, 88, 65, 88, 91};
        Pemain[] tim = new Pemain[nama.length];
        for (int i = 0; i < tim.length; i++) {
            tim[i] = new Pemain(nama[i], skor[i]);
        }
        cetak(tim);
        Pemain terbaik = tim[0];
        int total = 0;
        for (Pemain p : tim) {
            total += p.skor;
            if (p.skor > terbaik.skor) {
                terbaik = p;
            }
        }
        System.out.println("Terbaik: " + terbaik.nama + " (" + terbaik.skor + ")");
        System.out.printf("Rata-rata: %.2f%n", (double) total / tim.length);
        for (int i = 0; i < tim.length - 1; i++) {
            for (int j = 0; j < tim.length - 1 - i; j++) {
                if (tim[j].skor < tim[j + 1].skor) {
                    Pemain t = tim[j];
                    tim[j] = tim[j + 1];
                    tim[j + 1] = t;
                }
            }
            System.out.print("putaran " + (i + 1) + ": ");
            cetak(tim);
        }
        terbaik.skor += 5;
        System.out.println("Setelah bonus, tim[0] = " + tim[0].nama + " " + tim[0].skor);
    }
}
