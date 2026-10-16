// Array of String: urutkan nama, cari nama terpanjang, hitung huruf awal, gabungkan
import java.util.Arrays;

public class Main {
    public static void main(String[] args) {
        String[] mahasiswa = {"Rahmat", "Ayu", "Bagus", "Rini", "Agus", "Benny", "Ratna"};
        System.out.println("Jumlah: " + mahasiswa.length);
        String terpanjang = "";
        for (String m : mahasiswa) {
            if (m.length() > terpanjang.length()) {
                terpanjang = m;
            }
        }
        System.out.println("Nama terpanjang: " + terpanjang);
        int[] awal = new int[26];
        for (String m : mahasiswa) {
            awal[m.charAt(0) - 'A']++;
        }
        for (int i = 0; i < 26; i++) {
            if (awal[i] > 0) {
                System.out.println("Huruf " + (char) ('A' + i) + ": " + awal[i] + " orang");
            }
        }
        String[] urut = Arrays.copyOf(mahasiswa, mahasiswa.length);
        Arrays.sort(urut);
        System.out.println("Urut: " + String.join(", ", urut));
        System.out.println("Asli: " + Arrays.toString(mahasiswa));
        String cari = "Rini";
        int posisi = -1;
        for (int i = 0; i < mahasiswa.length; i++) {
            if (mahasiswa[i].equals(cari)) {
                posisi = i;
                break;
            }
        }
        System.out.println(cari + " ada di indeks " + posisi);
        String[] inisial = new String[mahasiswa.length];
        for (int i = 0; i < mahasiswa.length; i++) {
            inisial[i] = mahasiswa[i].substring(0, 2).toUpperCase();
        }
        System.out.println("Inisial: " + Arrays.toString(inisial));
    }
}
